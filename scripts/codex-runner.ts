import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";
import { PrismaClient, type RunEventType } from "@prisma/client";

const databaseUrl = process.env.CODEX_COMPANION_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  throw new Error("Set CODEX_COMPANION_DATABASE_URL or DATABASE_URL before starting the Codex runner.");
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});
const pollMs = Number(process.env.CODEX_RUNNER_POLL_MS ?? 5000);
const codexBin = process.env.CODEX_BIN ?? (process.platform === "win32" ? join(homedir(), "AppData", "Roaming", "npm", "codex.cmd") : "codex");
const runnerId = process.env.CODEX_RUNNER_ID ?? `local-${randomUUID()}`;
let stopping = false;

type CodexJsonEvent = {
  type?: string;
  message?: string;
  content?: string;
  item?: {
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  };
};

function mapCodexEvent(event: CodexJsonEvent): { type: RunEventType; content: string } | null {
  const text =
    event.message ??
    event.content ??
    event.item?.content?.map((part) => part.text ?? "").join("\n").trim() ??
    "";

  if (!text && event.type !== "task_complete") return null;
  if (event.type === "error") return { type: "ERROR", content: text || "Codex runner emitted an error." };
  if (event.type === "task_complete" || event.type === "agent_message") return { type: "OUTPUT_DELTA", content: text || "Codex task completed." };
  if (event.type === "exec_command_begin") return { type: "STATUS_CHANGE", content: text || "Codex started a command." };
  if (event.type === "exec_command_end") return { type: "STATUS_CHANGE", content: text || "Codex finished a command." };
  return text ? { type: "OUTPUT_DELTA", content: text } : null;
}

async function nextSequence(runId: string) {
  const last = await prisma.runEvent.findFirst({ where: { runId }, orderBy: { sequence: "desc" } });
  return (last?.sequence ?? 0) + 1;
}

async function createEvent(runId: string, type: RunEventType, content: string, payload?: unknown) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await prisma.runEvent.create({
        data: {
          runId,
          sequence: await nextSequence(runId),
          type,
          content,
          payload: payload === undefined ? undefined : JSON.parse(JSON.stringify(payload))
        }
      });
      return;
    } catch (error: any) {
      if (error?.code !== "P2002" || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

async function getWorkspaceDir(projectId: string) {
  const context = await prisma.projectContext.findFirst({
    where: { projectId, kind: "codex.workspace_dir" }
  });
  return context?.content;
}

function runCodex(prompt: string, cwd: string, onEvent: (event: CodexJsonEvent) => void) {
  return new Promise<{ code: number | null; output: string }>((resolve) => {
    const tempDir = mkdtempSync(join(tmpdir(), "codex-companion-run-"));
    const lastMessagePath = join(tempDir, "last-message.txt");
    const args = ["--ask-for-approval", "never", "--sandbox", "workspace-write", "exec", "--json", "--cd", cwd, "--output-last-message", lastMessagePath, "-"];
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/c", "call", codexBin, ...args], { cwd, env: process.env })
        : spawn(codexBin, args, { cwd, env: process.env });

    child.stdin.write(prompt);
    child.stdin.end();

    let output = "";
    let buffer = "";

    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      output += text;
      buffer += text;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          onEvent(JSON.parse(line) as CodexJsonEvent);
        } catch {
          onEvent({ type: "agent_message", content: line });
        }
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      output += text;
    });

    child.on("close", (code) => {
      const lastMessage = existsSync(lastMessagePath) ? readFileSync(lastMessagePath, "utf8") : "";
      rmSync(tempDir, { recursive: true, force: true });
      resolve({ code, output: lastMessage.trim() || output });
    });
  });
}

async function processRun() {
  const run = await prisma.run.findFirst({
    where: {
      status: "QUEUED",
      providerRunId: null
    },
    orderBy: { createdAt: "asc" },
    include: {
      project: true,
      thread: { include: { messages: { orderBy: { createdAt: "asc" } } } }
    }
  });

  if (!run) return false;

  const workspaceDir = await getWorkspaceDir(run.projectId);
  if (!workspaceDir || !existsSync(workspaceDir)) {
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        outputPreview: "No valid Codex workspace path is configured for this project."
      }
    });
    await createEvent(run.id, "ERROR", `Workspace path not found for ${run.project.name}: ${workspaceDir ?? "missing"}`);
    return true;
  }

  const providerRunId = `codex-local-${Date.now()}`;
  await prisma.run.update({
    where: { id: run.id },
    data: { status: "RUNNING", providerRunId, startedAt: new Date() }
  });
  await createEvent(run.id, "STATUS_CHANGE", `Picked up by ${runnerId} in ${workspaceDir}.`);

  const latestUserMessage = [...run.thread.messages].reverse().find((message) => message.role === "USER");
  const prompt = latestUserMessage?.content ?? run.title;

  const result = await runCodex(prompt, workspaceDir, async (event) => {
    const mapped = mapCodexEvent(event);
    if (mapped) await createEvent(run.id, mapped.type, mapped.content, event).catch(console.error);
  });

  if (result.code === 0) {
    const finalText = result.output.trim().slice(-12000);
    await prisma.message.create({
      data: {
        threadId: run.threadId,
        role: "ASSISTANT",
        content: finalText || "Codex run completed."
      }
    });
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        outputPreview: finalText.slice(0, 500)
      }
    });
    await createEvent(run.id, "OUTPUT_DONE", "Codex run completed.");
  } else {
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        outputPreview: result.output.trim().slice(-500) || `Codex exited with code ${result.code}.`
      }
    });
    await createEvent(run.id, "ERROR", `Codex exited with code ${result.code}.`);
  }

  return true;
}

async function loop() {
  console.log(`Codex runner ${runnerId} polling every ${pollMs}ms.`);
  console.log(`Database host: ${new URL(databaseUrl).host}`);
  while (!stopping) {
    try {
      await processRun();
      if (process.env.CODEX_RUNNER_ONCE === "true") {
        stopping = true;
      }
    } catch (error) {
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

process.on("SIGINT", () => {
  stopping = true;
});

loop()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

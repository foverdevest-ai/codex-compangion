import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir } from "node:os";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SessionIndexEntry = {
  id: string;
  thread_name: string;
  updated_at: string;
};

type SessionMeta = {
  id: string;
  cwd?: string;
  timestamp?: string;
  originator?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function walkJsonlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const output: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) output.push(...walkJsonlFiles(path));
    if (stat.isFile() && path.endsWith(".jsonl")) output.push(path);
  }
  return output;
}

function readSessionMeta(path: string): SessionMeta | null {
  const firstLine = readFileSync(path, "utf8").split(/\r?\n/, 1)[0];
  if (!firstLine) return null;
  const parsed = JSON.parse(firstLine) as { type?: string; payload?: SessionMeta };
  return parsed.type === "session_meta" ? parsed.payload ?? null : null;
}

function latestUserText(path: string) {
  const lines = readJsonl<Record<string, any>>(path);
  const texts: string[] = [];
  for (const line of lines) {
    const payload = line.payload;
    if (line.type === "response_item" && payload?.type === "message" && payload.role === "user") {
      const text = payload.content?.map((part: any) => part.text ?? "").join("\n").trim();
      if (text) texts.push(text);
    }
  }
  return texts.at(-1) ?? null;
}

async function main() {
  const codexHome = process.env.CODEX_HOME ?? join(homedir(), ".codex");
  const state = readJson<any>(join(codexHome, ".codex-global-state.json")) ?? {};
  const userEmail = process.env.SEED_USER_EMAIL ?? process.env.CODEX_COMPANION_USER_EMAIL ?? "dev@personeel.com";
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { name: "Dev Personeel" },
    create: { email: userEmail, name: "Dev Personeel" }
  });

  const roots = new Set<string>([
    ...(state["electron-saved-workspace-roots"] ?? []),
    ...(state["active-workspace-roots"] ?? []),
    process.cwd()
  ]);
  const labels = state["electron-workspace-root-labels"] ?? {};
  const projectByRoot = new Map<string, string>();

  for (const root of roots) {
    if (!root || !existsSync(root)) continue;
    const label = labels[root] ?? basename(root);
    const slug = `codex-local-${slugify(label || root)}`;
    const project = await prisma.project.upsert({
      where: { slug },
      update: {
        ownerId: user.id,
        name: label,
        description: `Local Codex workspace at ${root}`,
        tags: ["codex-local", "desktop-sync"],
        lastActiveAt: new Date()
      },
      create: {
        ownerId: user.id,
        name: label,
        slug,
        description: `Local Codex workspace at ${root}`,
        tags: ["codex-local", "desktop-sync"],
        contexts: {
          create: [
            { label: "Codex workspace", kind: "codex.workspace_dir", content: root },
            { label: "Runner mode", kind: "codex.runner", content: "Prompts are picked up by the local Codex runner and executed with Codex CLI." }
          ]
        }
      }
    });

    const existingWorkspaceContext = await prisma.projectContext.findFirst({
      where: { projectId: project.id, kind: "codex.workspace_dir" }
    });
    if (existingWorkspaceContext) {
      await prisma.projectContext.update({
        where: { id: existingWorkspaceContext.id },
        data: { content: root }
      });
    } else {
      await prisma.projectContext.create({
        data: {
          projectId: project.id,
          label: "Codex workspace",
          kind: "codex.workspace_dir",
          content: root
        }
      });
    }

    projectByRoot.set(root.toLowerCase(), project.id);
  }

  const indexEntries = readJsonl<SessionIndexEntry>(join(codexHome, "session_index.jsonl"));
  const latestNameById = new Map<string, SessionIndexEntry>();
  for (const entry of indexEntries) latestNameById.set(entry.id, entry);

  const sessionFiles = [
    ...walkJsonlFiles(join(codexHome, "sessions")),
    ...walkJsonlFiles(join(codexHome, "archived_sessions"))
  ];

  let importedThreads = 0;
  for (const path of sessionFiles) {
    const meta = readSessionMeta(path);
    if (!meta?.id || !meta.cwd) continue;
    const projectId = projectByRoot.get(meta.cwd.toLowerCase());
    if (!projectId) continue;
    const index = latestNameById.get(meta.id);
    const existing = await prisma.thread.findFirst({
      where: { projectId, summary: { contains: `codex-session:${meta.id}` } }
    });
    if (existing) continue;

    const title = index?.thread_name ?? basename(path).replace(/^rollout-/, "").replace(/\.jsonl$/, "");
    const lastUserText = latestUserText(path);
    const updatedAt = index?.updated_at ? new Date(index.updated_at) : new Date(meta.timestamp ?? Date.now());
    await prisma.thread.create({
      data: {
        projectId,
        title,
        summary: `Imported from Codex Desktop. codex-session:${meta.id}`,
        lastMessageAt: updatedAt,
        unread: false,
        messages: {
          create: [
            {
              role: "SYSTEM",
              content: `Imported Codex Desktop session ${meta.id} from ${meta.cwd}.`
            },
            ...(lastUserText ? [{ role: "USER" as const, content: lastUserText.slice(0, 12000) }] : [])
          ]
        }
      }
    });
    importedThreads += 1;
  }

  console.log(`Synced ${projectByRoot.size} Codex projects and imported ${importedThreads} threads for ${userEmail}.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

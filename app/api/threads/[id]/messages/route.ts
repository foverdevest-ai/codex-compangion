import { NextResponse } from "next/server";
import { z } from "zod";
import { CodexAppServerProvider } from "@/providers/codex-app-server-provider";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/server/auth/require-auth";

const schema = z.object({ content: z.string().min(1).max(12000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = schema.parse(await request.json());
  const thread = await prisma.thread.findUniqueOrThrow({ where: { id } });
  const provider = new CodexAppServerProvider();
  const message = await provider.appendMessage(id, body.content);
  const run = await provider.startRun({ projectId: thread.projectId, threadId: id, prompt: body.content });
  return NextResponse.json({ message, run, runner: { configured: run.status === "QUEUED" || Boolean(run.providerRunId) } });
}

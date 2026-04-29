import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CodexAppServerProvider } from "@/providers/codex-app-server-provider";
import { requireApiSession } from "@/server/auth/require-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const { id } = await params;
  const provider = new CodexAppServerProvider();
  await provider.syncRunnerEvents(id).catch(() => []);
  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      events: { orderBy: { sequence: "asc" } },
      approvalRequests: { where: { status: "PENDING" } }
    }
  });

  return NextResponse.json({ run });
}

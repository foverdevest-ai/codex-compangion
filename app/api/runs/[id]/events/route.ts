import { prisma } from "@/lib/prisma";
import { CodexAppServerProvider } from "@/providers/codex-app-server-provider";
import { requireApiSession } from "@/server/auth/require-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const provider = new CodexAppServerProvider();
      const syncError = await provider.syncRunnerEvents(id).then(() => null).catch((error) => error);
      const events = await prisma.runEvent.findMany({ where: { runId: id }, orderBy: { sequence: "asc" } });
      for (const event of events) {
        controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
      }
      if (syncError) {
        controller.enqueue(encoder.encode(`event: ERROR\ndata: ${JSON.stringify({ content: syncError instanceof Error ? syncError.message : "Runner sync failed" })}\n\n`));
      }
      controller.enqueue(encoder.encode(`event: heartbeat\ndata: {"ok":true}\n\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

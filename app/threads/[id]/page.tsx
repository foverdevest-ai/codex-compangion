import { notFound } from "next/navigation";
import { PromptComposer } from "@/features/threads/prompt-composer";
import { ApprovalInlineBanner } from "@/features/approvals/approval-inline-banner";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      project: true,
      messages: { orderBy: { createdAt: "asc" } },
      runs: { orderBy: { updatedAt: "desc" }, take: 1, include: { events: { orderBy: { sequence: "asc" } }, approvalRequests: { where: { status: "PENDING" } } } },
      artifacts: { orderBy: { updatedAt: "desc" } },
      approvalRequests: { where: { status: "PENDING" }, include: { run: true } }
    }
  });
  if (!thread) notFound();
  const run = thread.runs[0];

  return (
    <div className="space-y-5">
      <div className="sticky top-[98px] z-10 -mx-4 border-b bg-[var(--background)] px-4 py-3 sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">{thread.project.name}</div>
            <h1 className="text-xl font-semibold">{thread.title}</h1>
          </div>
          <div className="flex items-center gap-2">{run ? <RunStatusBadge status={run.status} /> : null}</div>
        </div>
      </div>

      {thread.approvalRequests.map((approval) => <ApprovalInlineBanner key={approval.id} approval={approval} />)}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {thread.messages.map((message) => (
            <article key={message.id} className="rounded-lg border bg-[var(--card)] p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span className="font-semibold uppercase tracking-wide">{message.role.toLowerCase()}</span>
                <time>{message.createdAt.toLocaleString()}</time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </article>
          ))}
          {run ? (
            <Card>
              <CardHeader><CardTitle>Live Run Stream</CardTitle></CardHeader>
              <CardContent className="space-y-2" aria-live="polite">
                {run.events.map((event) => (
                  <div key={event.id} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                    <span className="mr-2 font-medium">{event.type.toLowerCase()}</span>{event.content}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </section>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Artifacts</CardTitle></CardHeader>
            <CardContent className="space-y-2">{thread.artifacts.map((artifact) => <div key={artifact.id} className="rounded-md border p-3 text-sm">{artifact.title}</div>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Run Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <div>Status: {run?.status ?? "none"}</div>
              <div>Pending approvals: {thread.approvalRequests.length}</div>
              <div>Draft saved: {thread.draft ? "yes" : "no"}</div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <PromptComposer threadId={thread.id} draft={thread.draft ?? ""} />
    </div>
  );
}

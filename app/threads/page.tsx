import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { prisma } from "@/lib/prisma";
import { getActiveProject } from "@/server/projects/scope";

export default async function ThreadsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: projectId } = await searchParams;
  const activeProject = await getActiveProject(projectId);
  const threads = await prisma.thread.findMany({
    where: activeProject ? { projectId: activeProject.id } : { project: { status: "ACTIVE" } },
    orderBy: { lastMessageAt: "desc" },
    include: { project: true, approvalRequests: { where: { status: "PENDING" } }, runs: { orderBy: { updatedAt: "desc" }, take: 1 } }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
        <h1 className="text-2xl font-semibold">Threads</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {activeProject ? `Showing only ${activeProject.name}, sorted by latest prompt.` : "Choose a project to focus your cockpit."}
          </p>
        </div>
        <Link href="/projects" className="text-sm font-semibold text-[var(--color-primary-hover)]">Switch project</Link>
      </div>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" /><Input className="pl-9" placeholder="Search threads, project names, outputs..." /></div>
      <div className="space-y-3">
        {!threads.length ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold">No threads for {activeProject?.name ?? "the active project"}</div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Open another project or send a first prompt from this cockpit.</p>
            </CardContent>
          </Card>
        ) : null}
        {threads.map((thread) => (
          <Link key={thread.id} href={`/threads/${thread.id}`}>
            <Card className="hover:bg-[var(--muted)]">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2"><span className="font-medium">{thread.title}</span>{thread.unread ? <Badge tone="blue">changed</Badge> : null}</div>
                  <div className="mt-1 text-sm text-[var(--muted-foreground)]">{thread.project.name} / {thread.summary}</div>
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Last prompt {format(thread.lastMessageAt, "MMM d, yyyy HH:mm")} · {formatDistanceToNow(thread.lastMessageAt)} ago
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {thread.approvalRequests.length ? <Badge tone="amber">{thread.approvalRequests.length} approvals</Badge> : null}
                  {thread.runs[0] ? <RunStatusBadge status={thread.runs[0].status} /> : null}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

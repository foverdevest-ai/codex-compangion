import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { prisma } from "@/lib/prisma";

export default async function ThreadsPage() {
  const threads = await prisma.thread.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { project: true, approvalRequests: { where: { status: "PENDING" } }, runs: { orderBy: { updatedAt: "desc" }, take: 1 } }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Threads</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Continue coding work with project context, run state, and approval visibility.</p>
      </div>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" /><Input className="pl-9" placeholder="Search threads, project names, outputs..." /></div>
      <div className="space-y-3">
        {threads.map((thread) => (
          <Link key={thread.id} href={`/threads/${thread.id}`}>
            <Card className="hover:bg-[var(--muted)]">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2"><span className="font-medium">{thread.title}</span>{thread.unread ? <Badge tone="blue">changed</Badge> : null}</div>
                  <div className="mt-1 text-sm text-[var(--muted-foreground)]">{thread.project.name} / {thread.summary}</div>
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

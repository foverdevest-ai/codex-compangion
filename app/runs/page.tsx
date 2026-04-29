import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { formatDuration } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function RunsPage() {
  const runs = await prisma.run.findMany({ include: { project: true, thread: true, approvalRequests: { where: { status: "PENDING" } } }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-semibold">Runs</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Execution history with status, duration, output previews, and approval links.</p></div>
      <Input placeholder="Filter runs..." />
      <div className="space-y-3">
        {runs.map((run) => (
          <Link key={run.id} href={`/threads/${run.threadId}`}>
            <Card><CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div><div className="font-medium">{run.title}</div><div className="text-sm text-[var(--muted-foreground)]">{run.project.name} / {run.thread.title}</div><div className="mt-1 text-sm text-[var(--muted-foreground)]">{run.outputPreview}</div></div>
              <div className="flex items-center gap-2"><RunStatusBadge status={run.status} /><span className="text-xs text-[var(--muted-foreground)]">{formatDuration(run.durationMs)}</span></div>
            </CardContent></Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

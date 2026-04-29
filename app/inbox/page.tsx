import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function InboxPage() {
  const [approvals, failedRuns, notifications] = await Promise.all([
    prisma.approvalRequest.findMany({ where: { status: "PENDING" }, include: { project: true, thread: true }, orderBy: { requestedAt: "desc" } }),
    prisma.run.findMany({ where: { status: "FAILED" }, include: { project: true, thread: true }, orderBy: { failedAt: "desc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-semibold">Inbox</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Unified activity center for approvals, run failures, sync notices, and system updates.</p></div>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <Link key={approval.id} href={`/approvals?selected=${approval.id}`}>
            <Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-medium">{approval.title}</div><div className="text-sm text-[var(--muted-foreground)]">{approval.project.name} / {approval.thread.title}</div></div><Badge tone="amber">approval</Badge></CardContent></Card>
          </Link>
        ))}
        {failedRuns.map((run) => (
          <Link key={run.id} href={`/threads/${run.threadId}`}>
            <Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-medium">{run.title}</div><div className="text-sm text-[var(--muted-foreground)]">{run.outputPreview}</div></div><Badge tone="red">failed</Badge></CardContent></Card>
          </Link>
        ))}
        {notifications.map((notice) => (
          <Card key={notice.id}><CardContent className="flex items-center justify-between p-4"><div><div className="font-medium">{notice.title}</div><div className="text-sm text-[var(--muted-foreground)]">{notice.body}</div></div><Badge>{notice.type.toLowerCase()}</Badge></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

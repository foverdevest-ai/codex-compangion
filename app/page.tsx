import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { getDashboardData } from "@/server/repositories/dashboard-repository";
import { formatDistanceToNow } from "date-fns";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Pending approvals" value={data.approvals.length} icon={<ShieldAlert className="h-5 w-5" />} tone="text-amber-700" />
        <Metric title="Running tasks" value={data.runs.length} icon={<Clock className="h-5 w-5" />} tone="text-blue-700" />
        <Metric title="Failed runs" value={data.failedRuns.length} icon={<AlertTriangle className="h-5 w-5" />} tone="text-red-700" />
        <Metric title="Active projects" value={data.projects.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="text-green-700" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continue Where You Left Off</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/threads">All threads</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.id}`} className="block rounded-md border p-4 hover:bg-[var(--muted)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{thread.title}</div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">{thread.project.name}</div>
                  </div>
                  {thread.approvalRequests.length ? <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{thread.approvalRequests.length} approvals</span> : null}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Approval Inbox</CardTitle>
            <Button asChild size="sm"><Link href="/approvals">Review <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.approvals.slice(0, 5).map((approval) => (
              <Link key={approval.id} href={`/approvals?selected=${approval.id}`} className="block rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <div className="font-medium">{approval.title}</div>
                <div className="mt-1 text-sm opacity-80">{approval.project.name} / {approval.thread.title}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Currently Running</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.runs.map((run) => (
              <Link key={run.id} href={`/threads/${run.threadId}`} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{run.title}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{run.project.name}</div>
                </div>
                <RunStatusBadge status={run.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Projects</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-md border p-4">
                <div className="font-medium">{project.name}</div>
                <div className="mt-1 text-sm text-[var(--muted-foreground)]">{project.description}</div>
                <div className="mt-2 text-xs text-[var(--muted-foreground)]">Active {formatDistanceToNow(project.lastActiveAt)} ago</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ title, value, icon, tone }: { title: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm text-[var(--muted-foreground)]">{title}</div>
          <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
        <div className={tone}>{icon}</div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RunStatusBadge } from "@/components/layout/status-badges";
import { prisma } from "@/lib/prisma";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      contexts: true,
      threads: { orderBy: { lastMessageAt: "desc" }, include: { approvalRequests: { where: { status: "PENDING" } } } },
      runs: { orderBy: { updatedAt: "desc" }, take: 5 },
      promptTemplates: true,
      artifacts: { take: 5, orderBy: { updatedAt: "desc" } },
      approvalRequests: { where: { status: "PENDING" } }
    }
  });
  if (!project) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted-foreground)]">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">{project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        </div>
        <Button asChild><Link href="/approvals">Review {project.approvalRequests.length} approvals</Link></Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Saved Context</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {project.contexts.map((context) => (
                <div key={context.id} className="rounded-md border p-4">
                  <div className="text-sm font-medium">{context.label}</div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{context.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Threads</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {project.threads.map((thread) => (
                <Link href={`/threads/${thread.id}`} key={thread.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{thread.title}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">{thread.summary}</div>
                  </div>
                  {thread.approvalRequests.length ? <Badge tone="amber">{thread.approvalRequests.length}</Badge> : null}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Active Runs</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {project.runs.map((run) => (
                <div key={run.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{run.title}</span><RunStatusBadge status={run.status} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Templates</CardTitle></CardHeader>
            <CardContent className="space-y-2">{project.promptTemplates.map((template) => <div key={template.id} className="rounded-md border p-3 text-sm">{template.title}</div>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Artifacts</CardTitle></CardHeader>
            <CardContent className="space-y-2">{project.artifacts.map((artifact) => <div key={artifact.id} className="rounded-md border p-3 text-sm">{artifact.title}</div>)}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { lastActiveAt: "desc" },
    include: { threads: { orderBy: { lastMessageAt: "desc" }, take: 1 }, approvalRequests: { where: { status: "PENDING" } } }
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Projects" description="Long-lived coding contexts with threads, templates, artifacts, and approvals." action="Create project" />
      <Input placeholder="Search projects..." />
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{project.description}</p>
                </div>
                {project.approvalRequests.length ? <Badge tone="amber">{project.approvalRequests.length} pending</Badge> : <Badge tone="green">clear</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">{project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                <span>Active {formatDistanceToNow(project.lastActiveAt)} ago</span>
                <Button asChild size="sm"><Link href={`/projects/${project.id}`}>Open</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
      <Button>{action}</Button>
    </div>
  );
}

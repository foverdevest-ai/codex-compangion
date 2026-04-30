import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import type { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { lastActiveAt: "desc" },
    include: {
      threads: { orderBy: { lastMessageAt: "desc" }, take: 1 },
      approvalRequests: { where: { status: "PENDING" } },
      _count: { select: { threads: true } }
    }
  });
  const visibleProjects = projects.filter((project) => project.status !== "HIDDEN");
  const hiddenProjects = projects.filter((project) => project.status === "HIDDEN");

  return (
    <div className="space-y-5">
      <PageHeader title="Projects" description="Choose the project cockpit you want active on mobile and desktop." action="Create project" />
      <Input placeholder="Search projects..." />
      <ProjectGrid projects={visibleProjects} hidden={false} />
      {hiddenProjects.length ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Hidden from cockpit</h2>
            <p className="text-sm text-[var(--muted-foreground)]">These projects are kept, but not shown in Threads or Approvals until you turn them back on.</p>
          </div>
          <ProjectGrid projects={hiddenProjects} hidden />
        </section>
      ) : null}
    </div>
  );
}

type ProjectWithMeta = Prisma.ProjectGetPayload<{
  include: {
    threads: { select: { id: true; title: true; lastMessageAt: true } };
    approvalRequests: { select: { id: true } };
    _count: { select: { threads: true } };
  };
}>;

function ProjectGrid({ projects, hidden }: { projects: ProjectWithMeta[]; hidden: boolean }) {
  if (!projects.length) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="font-medium">No {hidden ? "hidden" : "active"} projects</div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{hidden ? "Every project is currently visible in the cockpit." : "Turn a project back on or sync Codex Desktop projects to continue."}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {projects.map((project) => {
        const latestThread = project.threads[0];
        return (
          <Card key={project.id} className={hidden ? "opacity-75" : ""}>
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
              <div className="mb-4 grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
                <div>
                  <div className="font-semibold text-[var(--foreground)]">Last project activity</div>
                  <div>{format(project.lastActiveAt, "MMM d, yyyy HH:mm")}</div>
                  <div>{formatDistanceToNow(project.lastActiveAt)} ago</div>
                </div>
                <div>
                  <div className="font-semibold text-[var(--foreground)]">Last thread prompt</div>
                  <div>{latestThread ? format(latestThread.lastMessageAt, "MMM d, yyyy HH:mm") : "No prompts yet"}</div>
                  {latestThread ? <div>{latestThread.title}</div> : null}
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge>{project._count.threads} threads</Badge>
                {project.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {hidden ? <span className="text-sm text-[var(--muted-foreground)]">Hidden from Threads and Approvals</span> : (
                  <Button asChild size="sm">
                    <Link href={`/api/projects/${project.id}/activate`}>Open threads</Link>
                  </Button>
                )}
                <form action={`/api/projects/${project.id}/visibility`} method="post">
                  <input type="hidden" name="status" value={hidden ? "ACTIVE" : "HIDDEN"} />
                  <Button type="submit" size="sm" variant="outline">{hidden ? "Show in cockpit" : "Hide from cockpit"}</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        );
      })}
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

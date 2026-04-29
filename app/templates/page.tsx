import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function TemplatesPage() {
  const templates = await prisma.promptTemplate.findMany({ include: { project: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold">Templates</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Reusable prompts for build, fix, refactor, review, architecture, migration, and testing workflows.</p></div><Button>Create template</Button></div>
      <Input placeholder="Search templates..." />
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader><CardTitle>{template.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{template.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">{template.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}<Badge tone={template.isGlobal ? "blue" : "neutral"}>{template.project?.name ?? "global"}</Badge></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

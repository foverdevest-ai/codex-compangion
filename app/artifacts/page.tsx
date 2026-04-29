import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function ArtifactsPage() {
  const artifacts = await prisma.artifact.findMany({ include: { project: true, thread: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-semibold">Artifacts</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Saved outputs, snippets, docs, prompts, files, and notes grouped by project and thread.</p></div>
      <Input placeholder="Search artifacts..." />
      <div className="grid gap-4 lg:grid-cols-3">
        {artifacts.map((artifact) => (
          <Card key={artifact.id}>
            <CardHeader><CardTitle>{artifact.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="line-clamp-4 text-sm leading-6 text-[var(--muted-foreground)]">{artifact.content}</p>
              <div className="mt-4 flex flex-wrap gap-2"><Badge>{artifact.type.toLowerCase()}</Badge><Badge tone="blue">{artifact.project.name}</Badge>{artifact.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

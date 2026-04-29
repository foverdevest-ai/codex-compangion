import { ApprovalDetailPanel } from "@/features/approvals/approval-detail-panel";
import { ApprovalStatusBadge, RiskBadge } from "@/components/layout/status-badges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ selected?: string }> }) {
  const { selected } = await searchParams;
  const approvals = await prisma.approvalRequest.findMany({
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    include: { project: true, thread: true, run: true, decisions: { orderBy: { decidedAt: "desc" } } }
  });
  const selectedApproval = approvals.find((approval) => approval.id === selected) ?? approvals.find((approval) => approval.status === "PENDING") ?? approvals[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Review, approve, reject, and audit Codex actions before runs continue.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <section className="space-y-3">
          <Input placeholder="Filter by project, thread, risk, type, or resource..." />
          {approvals.map((approval) => (
            <a key={approval.id} href={`/approvals?selected=${approval.id}`} className="block">
              <Card className={approval.id === selectedApproval?.id ? "border-[var(--accent)]" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{approval.title}</span>
                        <ApprovalStatusBadge status={approval.status} />
                        <RiskBadge risk={approval.riskLevel} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{approval.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                        <span>{approval.project.name}</span>
                        <span>/</span>
                        <span>{approval.thread.title}</span>
                        {approval.targetResource ? <Badge>{approval.targetResource}</Badge> : null}
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">{approval.requestedAt.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </section>
        {selectedApproval ? <ApprovalDetailPanel approval={selectedApproval} /> : null}
      </div>
    </div>
  );
}

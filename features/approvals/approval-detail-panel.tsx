"use client";

import type { ApprovalDecision, ApprovalRequest, Project, Run, Thread } from "@prisma/client";
import { Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { ApprovalStatusBadge, RiskBadge, RunStatusBadge } from "@/components/layout/status-badges";

type ApprovalWithLinks = ApprovalRequest & {
  project: Project;
  thread: Thread;
  run: Run;
  decisions: ApprovalDecision[];
};

export function ApprovalDetailPanel({ approval }: { approval: ApprovalWithLinks }) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function decide(decision: "approve" | "reject") {
    startTransition(async () => {
      await fetch(`/api/approvals/${approval.id}/${decision}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note })
      });
      window.location.reload();
    });
  }

  return (
    <Card className="sticky top-[110px] h-fit">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{approval.title}</CardTitle>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{approval.summary}</p>
          </div>
          <ApprovalStatusBadge status={approval.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <RiskBadge risk={approval.riskLevel} />
          <RunStatusBadge status={approval.run.status} />
          <span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs font-medium">{approval.approvalType.replace("_", " ").toLowerCase()}</span>
        </div>

        <Detail label="Project" value={approval.project.name} />
        <Detail label="Thread" value={approval.thread.title} />
        <Detail label="Target" value={approval.targetResource ?? "Not specified"} />
        <Detail label="Requested" value={approval.requestedAt.toLocaleString()} />
        <Detail label="What happens" value={approval.actionContext ?? "The linked run resumes with the decision recorded in the audit trail."} />

        <section>
          <h2 className="text-sm font-semibold">Reason</h2>
          <p className="mt-2 rounded-md border bg-[var(--muted)] p-3 text-sm leading-6">{approval.detailedReason}</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Decision note</h2>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for the audit trail" />
        </section>

        {approval.decisions.length ? (
          <section>
            <h2 className="text-sm font-semibold">History</h2>
            <div className="mt-2 space-y-2">
              {approval.decisions.map((decision) => (
                <div key={decision.id} className="rounded-md border p-3 text-sm">
                  {decision.status.toLowerCase()} by {decision.decidedBy} at {decision.decidedAt.toLocaleString()}
                  {decision.note ? <div className="mt-1 text-[var(--muted-foreground)]">{decision.note}</div> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {approval.status === "PENDING" ? (
          <div className="sticky bottom-0 -mx-5 flex gap-2 border-t bg-[var(--card)] p-5 safe-bottom">
            <Button className="flex-1" onClick={() => decide("approve")} disabled={pending}><Check className="h-4 w-4" /> Approve</Button>
            <Button className="flex-1" variant="destructive" onClick={() => decide("reject")} disabled={pending}><X className="h-4 w-4" /> Reject</Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

import type { ApprovalStatus, RiskLevel, RunStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const tone = status === "COMPLETED" ? "green" : status === "FAILED" || status === "CANCELLED" ? "red" : status === "WAITING_APPROVAL" ? "amber" : status === "RUNNING" ? "blue" : "neutral";
  return <Badge tone={tone}>{status.replace("_", " ").toLowerCase()}</Badge>;
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const tone = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : status === "PENDING" ? "amber" : "neutral";
  return <Badge tone={tone}>{status.toLowerCase()}</Badge>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const tone = risk === "CRITICAL" || risk === "HIGH" ? "red" : risk === "MEDIUM" ? "amber" : "green";
  return <Badge tone={tone}>{risk.toLowerCase()} risk</Badge>;
}

import { ApprovalStatus, RunStatus } from "@prisma/client";

const terminalApprovalStates = new Set<ApprovalStatus>([
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED"
]);

export function assertApprovalTransition(from: ApprovalStatus, to: ApprovalStatus) {
  if (from === to) return;
  if (terminalApprovalStates.has(from)) {
    throw new Error(`Approval cannot transition from ${from} to ${to}`);
  }
  if (from !== "PENDING") {
    throw new Error(`Unsupported approval transition from ${from} to ${to}`);
  }
}

export function resolveRunStatusAfterApproval(hasPendingApprovals: boolean) {
  return hasPendingApprovals ? RunStatus.WAITING_APPROVAL : RunStatus.RUNNING;
}

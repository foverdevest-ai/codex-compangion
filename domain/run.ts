import { RunStatus } from "@prisma/client";

const allowed: Record<RunStatus, RunStatus[]> = {
  QUEUED: ["RUNNING", "CANCELLED", "FAILED"],
  RUNNING: ["WAITING_APPROVAL", "COMPLETED", "FAILED", "CANCELLED"],
  WAITING_APPROVAL: ["RUNNING", "FAILED", "CANCELLED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: []
};

export function assertRunTransition(from: RunStatus, to: RunStatus) {
  if (from === to) return;
  if (!allowed[from].includes(to)) {
    throw new Error(`Run cannot transition from ${from} to ${to}`);
  }
}

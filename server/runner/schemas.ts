import { z } from "zod";

export const runnerRunEventSchema = z.object({
  type: z.enum(["OUTPUT_DELTA", "OUTPUT_DONE", "STATUS_CHANGE", "APPROVAL_REQUESTED", "APPROVAL_RESOLVED", "ERROR", "SYSTEM_NOTE"]),
  content: z.string().optional(),
  payload: z.unknown().optional()
});

export const runnerStartRunResponseSchema = z.object({
  providerRunId: z.string(),
  status: z.enum(["QUEUED", "RUNNING", "WAITING_APPROVAL", "COMPLETED", "FAILED", "CANCELLED"]).default("RUNNING")
});

export type RunnerRunEvent = z.infer<typeof runnerRunEventSchema>;

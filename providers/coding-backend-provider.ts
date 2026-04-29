import type { ApprovalRequest, Artifact, Message, Run, RunEvent, Thread } from "@prisma/client";

export type StartRunInput = {
  projectId: string;
  threadId: string;
  prompt: string;
};

export type ApprovalDecisionInput = {
  approvalRequestId: string;
  note?: string;
};

export interface CodingBackendProvider {
  createThread(projectId: string, title: string): Promise<Thread>;
  appendMessage(threadId: string, content: string): Promise<Message>;
  startRun(input: StartRunInput): Promise<Run>;
  streamRunEvents(runId: string): AsyncIterable<RunEvent>;
  listPendingApprovals(): Promise<ApprovalRequest[]>;
  approveRequest(input: ApprovalDecisionInput): Promise<ApprovalRequest>;
  rejectRequest(input: ApprovalDecisionInput): Promise<ApprovalRequest>;
  listArtifacts(projectId: string): Promise<Artifact[]>;
  getRun(runId: string): Promise<Run | null>;
  getThread(threadId: string): Promise<Thread | null>;
}

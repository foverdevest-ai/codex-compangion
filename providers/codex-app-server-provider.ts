import { prisma } from "@/lib/prisma";
import { decideApproval } from "@/server/services/approval-service";
import type { ApprovalDecisionInput, CodingBackendProvider, StartRunInput } from "./coding-backend-provider";

export class CodexAppServerProvider implements CodingBackendProvider {
  async createThread(projectId: string, title: string) {
    return prisma.thread.create({ data: { projectId, title } });
  }

  async appendMessage(threadId: string, content: string) {
    return prisma.message.create({ data: { threadId, role: "USER", content } });
  }

  async startRun(input: StartRunInput) {
    const run = await prisma.run.create({
      data: {
        projectId: input.projectId,
        threadId: input.threadId,
        title: input.prompt.slice(0, 90),
        status: "RUNNING",
        startedAt: new Date(),
        events: {
          create: [
            { sequence: 1, type: "STATUS_CHANGE", content: "Run started" },
            { sequence: 2, type: "OUTPUT_DELTA", content: "Connecting to coding backend..." }
          ]
        }
      }
    });
    return run;
  }

  async *streamRunEvents(runId: string) {
    const events = await prisma.runEvent.findMany({ where: { runId }, orderBy: { sequence: "asc" } });
    for (const event of events) yield event;
  }

  async listPendingApprovals() {
    return prisma.approvalRequest.findMany({ where: { status: "PENDING" }, orderBy: { requestedAt: "desc" } });
  }

  async approveRequest(input: ApprovalDecisionInput) {
    return decideApproval(input.approvalRequestId, "APPROVED", input.note);
  }

  async rejectRequest(input: ApprovalDecisionInput) {
    return decideApproval(input.approvalRequestId, "REJECTED", input.note);
  }

  async listArtifacts(projectId: string) {
    return prisma.artifact.findMany({ where: { projectId }, orderBy: { updatedAt: "desc" } });
  }

  async getRun(runId: string) {
    return prisma.run.findUnique({ where: { id: runId } });
  }

  async getThread(threadId: string) {
    return prisma.thread.findUnique({ where: { id: threadId } });
  }
}

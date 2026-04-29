import { prisma } from "@/lib/prisma";
import { decideApproval } from "@/server/services/approval-service";
import { CodexRunnerClient } from "@/server/runner/client";
import type { ApprovalDecisionInput, CodingBackendProvider, StartRunInput } from "./coding-backend-provider";

export class CodexAppServerProvider implements CodingBackendProvider {
  private readonly runner = new CodexRunnerClient();

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
        status: this.runner.configured ? "QUEUED" : "RUNNING",
        startedAt: new Date(),
        events: {
          create: [
            { sequence: 1, type: "STATUS_CHANGE", content: this.runner.configured ? "Queued for cloud Codex runner" : "Run started in local scaffold mode" },
            { sequence: 2, type: "OUTPUT_DELTA", content: this.runner.configured ? "Connecting to cloud Codex runner..." : "Configure CODEX_RUNNER_URL and CODEX_RUNNER_TOKEN to execute real Codex tasks." }
          ]
        }
      }
    });

    if (!this.runner.configured) return run;

    try {
      const runnerRun = await this.runner.startRun({
        appRunId: run.id,
        projectId: input.projectId,
        threadId: input.threadId,
        prompt: input.prompt
      });

      if (!runnerRun) return run;

      return prisma.run.update({
        where: { id: run.id },
        data: {
          providerRunId: runnerRun.providerRunId,
          status: runnerRun.status,
          events: {
            create: {
              sequence: 3,
              type: "STATUS_CHANGE",
              content: `Cloud runner accepted run ${runnerRun.providerRunId}`,
              payload: runnerRun
            }
          }
        }
      });
    } catch (error) {
      return prisma.run.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          outputPreview: "Cloud runner rejected or failed to start the run.",
          events: {
            create: {
              sequence: 3,
              type: "ERROR",
              content: error instanceof Error ? error.message : "Unknown runner start failure"
            }
          }
        }
      });
    }
  }

  async syncRunnerEvents(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run?.providerRunId || !this.runner.configured) return [];

    const runnerEvents = await this.runner.listRunEvents(run.providerRunId);
    if (!runnerEvents.length) return [];

    const last = await prisma.runEvent.findFirst({ where: { runId }, orderBy: { sequence: "desc" } });
    let sequence = last?.sequence ?? 0;
    const created = [];

    for (const event of runnerEvents) {
      sequence += 1;
      created.push(
        await prisma.runEvent.create({
          data: {
            runId,
            sequence,
            type: event.type,
            content: event.content,
            payload: event.payload === undefined ? undefined : JSON.parse(JSON.stringify(event.payload))
          }
        })
      );
    }

    return created;
  }

  async *streamRunEvents(runId: string) {
    const events = await prisma.runEvent.findMany({ where: { runId }, orderBy: { sequence: "asc" } });
    for (const event of events) yield event;
  }

  async listPendingApprovals() {
    return prisma.approvalRequest.findMany({ where: { status: "PENDING" }, orderBy: { requestedAt: "desc" } });
  }

  async approveRequest(input: ApprovalDecisionInput) {
    const approval = await decideApproval(input.approvalRequestId, "APPROVED", input.note);
    await this.runner.sendApprovalDecision({
      providerRunId: approval.run.providerRunId,
      approvalRequestId: input.approvalRequestId,
      status: "APPROVED",
      note: input.note
    });
    return approval;
  }

  async rejectRequest(input: ApprovalDecisionInput) {
    const approval = await decideApproval(input.approvalRequestId, "REJECTED", input.note);
    await this.runner.sendApprovalDecision({
      providerRunId: approval.run.providerRunId,
      approvalRequestId: input.approvalRequestId,
      status: "REJECTED",
      note: input.note
    });
    return approval;
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

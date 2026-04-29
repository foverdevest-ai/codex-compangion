import { ApprovalStatus } from "@prisma/client";
import { assertApprovalTransition, resolveRunStatusAfterApproval } from "@/domain/approval";
import { prisma } from "@/lib/prisma";

export async function decideApproval(id: string, status: Extract<ApprovalStatus, "APPROVED" | "REJECTED">, note?: string) {
  return prisma.$transaction(async (tx) => {
    const approval = await tx.approvalRequest.findUniqueOrThrow({ where: { id } });
    assertApprovalTransition(approval.status, status);

    const decidedAt = new Date();
    const updated = await tx.approvalRequest.update({
      where: { id },
      data: {
        status,
        decisionNote: note,
        approvedAt: status === "APPROVED" ? decidedAt : null,
        rejectedAt: status === "REJECTED" ? decidedAt : null,
        decisions: { create: { status, note, decidedAt } }
      },
      include: { project: true, thread: true, run: true }
    });

    await tx.runEvent.create({
      data: {
        runId: approval.runId,
        type: "APPROVAL_RESOLVED",
        sequence: await nextRunEventSequence(approval.runId),
        content: `${approval.title} ${status.toLowerCase()}`,
        payload: { approvalRequestId: id, status, note }
      }
    });

    const pendingCount = await tx.approvalRequest.count({
      where: { runId: approval.runId, status: "PENDING" }
    });

    await tx.run.update({
      where: { id: approval.runId },
      data: { status: resolveRunStatusAfterApproval(pendingCount > 0) }
    });

    return updated;
  });
}

async function nextRunEventSequence(runId: string) {
  const last = await prisma.runEvent.findFirst({ where: { runId }, orderBy: { sequence: "desc" } });
  return (last?.sequence ?? 0) + 1;
}

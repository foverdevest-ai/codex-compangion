import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [projects, threads, runs, approvals, failedRuns] = await Promise.all([
    prisma.project.findMany({ orderBy: { lastActiveAt: "desc" }, take: 4, include: { threads: { take: 1, orderBy: { lastMessageAt: "desc" } } } }),
    prisma.thread.findMany({ orderBy: { lastMessageAt: "desc" }, take: 5, include: { project: true, approvalRequests: { where: { status: "PENDING" } } } }),
    prisma.run.findMany({ where: { status: { in: ["RUNNING", "WAITING_APPROVAL", "QUEUED"] } }, orderBy: { updatedAt: "desc" }, include: { project: true, thread: true } }),
    prisma.approvalRequest.findMany({ where: { status: "PENDING" }, orderBy: [{ riskLevel: "desc" }, { requestedAt: "desc" }], include: { project: true, thread: true, run: true } }),
    prisma.run.findMany({ where: { status: "FAILED" }, orderBy: { failedAt: "desc" }, take: 4, include: { project: true, thread: true } })
  ]);

  return { projects, threads, runs, approvals, failedRuns };
}

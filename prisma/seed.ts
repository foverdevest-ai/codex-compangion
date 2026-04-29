import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.approvalDecision.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.runEvent.deleteMany();
  await prisma.run.deleteMany();
  await prisma.message.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.promptTemplate.deleteMany();
  await prisma.projectContext.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "founder@codex-companion.local",
      name: "Founder"
    }
  });

  const workspace = await prisma.project.create({
    data: {
      ownerId: user.id,
      name: "Atlas Control Plane",
      slug: "atlas-control-plane",
      description: "Long-running platform rebuild with auth, billing, workflow orchestration, and admin tooling.",
      tags: ["nextjs", "platform", "billing"],
      contexts: {
        create: [
          { label: "Project brief", kind: "brief", content: "Rebuild the internal platform into a reliable, observable control plane for operations teams." },
          { label: "Architecture notes", kind: "architecture", content: "Next.js app router, Prisma/Postgres, queue-backed workflow services, strict server-side validation." },
          { label: "Current priorities", kind: "priorities", content: "Finish approval-gated automation, tighten audit logging, and improve mobile operations flows." }
        ]
      }
    }
  });

  const mobile = await prisma.project.create({
    data: {
      ownerId: user.id,
      name: "Field Ops Mobile",
      slug: "field-ops-mobile",
      description: "Mobile-first incident workflow for field teams with offline capture and live escalation.",
      tags: ["pwa", "mobile", "ops"],
      contexts: {
        create: [
          { label: "Coding rules", kind: "rules", content: "Prefer accessible native controls, optimistic updates only with rollback, and visible sync status." },
          { label: "Deployment notes", kind: "deployment", content: "Vercel web, Neon Postgres, Sentry, and staged feature flags." }
        ]
      }
    }
  });

  const threadA = await prisma.thread.create({
    data: {
      projectId: workspace.id,
      title: "Approval-gated deployment workflow",
      summary: "Implementing explicit approval checkpoints before file writes, commands, and git actions.",
      unread: true,
      draft: "Continue from the pending migration approval and add audit coverage.",
      messages: {
        create: [
          { role: "USER", content: "Build the deployment approval flow and make the approval inbox impossible to miss." },
          { role: "ASSISTANT", content: "I added the approval domain model and started wiring request resolution into run events. Waiting on command approval before generating the migration." }
        ]
      }
    }
  });

  const threadB = await prisma.thread.create({
    data: {
      projectId: workspace.id,
      title: "Billing settings refactor",
      summary: "Move plan limits into a typed service and add contract tests.",
      messages: {
        create: [
          { role: "USER", content: "Refactor billing settings so the UI can show limits consistently." },
          { role: "ASSISTANT", content: "The service shape is ready. Next step is replacing direct config reads in the admin views." }
        ]
      }
    }
  });

  const threadC = await prisma.thread.create({
    data: {
      projectId: mobile.id,
      title: "Offline incident composer",
      summary: "Persistent mobile composer with safe-area handling and sync retry notices.",
      unread: false,
      messages: {
        create: [
          { role: "USER", content: "Design the incident composer for one-handed mobile use." },
          { role: "ASSISTANT", content: "Composer remains sticky, stores local drafts, and exposes sync state near submit." }
        ]
      }
    }
  });

  const runA = await prisma.run.create({
    data: {
      projectId: workspace.id,
      threadId: threadA.id,
      title: "Generate migration and approval audit trail",
      status: "WAITING_APPROVAL",
      startedAt: new Date(Date.now() - 18 * 60_000),
      outputPreview: "Prepared schema changes and requested approval before writing migration files.",
      events: {
        create: [
          { sequence: 1, type: "STATUS_CHANGE", content: "Run started" },
          { sequence: 2, type: "OUTPUT_DELTA", content: "Inspecting Prisma schema and approval service..." },
          { sequence: 3, type: "APPROVAL_REQUESTED", content: "Approval requested for migration file write" }
        ]
      }
    }
  });

  const runB = await prisma.run.create({
    data: {
      projectId: workspace.id,
      threadId: threadB.id,
      title: "Billing settings service extraction",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 4 * 60 * 60_000),
      completedAt: new Date(Date.now() - 3 * 60 * 60_000),
      durationMs: 3600000,
      outputPreview: "Extracted BillingSettingsService and added plan limit tests.",
      events: { create: [{ sequence: 1, type: "OUTPUT_DONE", content: "Completed service extraction." }] }
    }
  });

  const runC = await prisma.run.create({
    data: {
      projectId: mobile.id,
      threadId: threadC.id,
      title: "Offline composer sync queue",
      status: "FAILED",
      startedAt: new Date(Date.now() - 40 * 60_000),
      failedAt: new Date(Date.now() - 31 * 60_000),
      durationMs: 540000,
      outputPreview: "Failed while validating IndexedDB fallback behavior.",
      events: { create: [{ sequence: 1, type: "ERROR", content: "IndexedDB adapter test failed in browser runner." }] }
    }
  });

  const approvals = [
    ["FILE_WRITE", "Create Prisma migration", "Write migration files for approval audit tables.", "HIGH", "prisma/migrations/*", "Approve file write"],
    ["COMMAND_EXECUTION", "Run database migration", "Execute prisma migrate dev against the local development database.", "HIGH", "npm run db:migrate", "Approve command"],
    ["GIT_ACTION", "Create working branch", "Create codex/approval-workflow and stage completed files.", "MEDIUM", "git checkout -b codex/approval-workflow", "Approve git action"],
    ["NETWORK_ACCESS", "Fetch package metadata", "Check latest compatible PWA helper package before installation.", "LOW", "registry.npmjs.org", "Approve network access"],
    ["TOOL_USE", "Open browser verification", "Use local browser automation to verify mobile approval drawer behavior.", "MEDIUM", "localhost:3000", "Approve tool use"]
  ] as const;

  for (const [approvalType, title, summary, riskLevel, targetResource, actionLabel] of approvals) {
    await prisma.approvalRequest.create({
      data: {
        projectId: workspace.id,
        threadId: threadA.id,
        runId: runA.id,
        approvalType,
        title,
        summary,
        detailedReason: `${summary} Codex paused this run so you can inspect the exact action and decide from desktop or phone.`,
        riskLevel,
        targetResource,
        actionLabel,
        actionContext: "This run will resume after the decision is recorded.",
        rawPayload: { provider: "codex-app-server", demo: true }
      }
    });
  }

  const historical = await prisma.approvalRequest.create({
    data: {
      projectId: workspace.id,
      threadId: threadB.id,
      runId: runB.id,
      status: "APPROVED",
      approvalType: "FILE_WRITE",
      title: "Update billing service",
      summary: "Write service and tests for billing plan limits.",
      detailedReason: "Low blast radius code change with test coverage.",
      riskLevel: "LOW",
      targetResource: "server/services/billing-settings.ts",
      actionLabel: "Approve file write",
      approvedAt: new Date(Date.now() - 3.5 * 60 * 60_000),
      decisionNote: "Looks scoped."
    }
  });
  await prisma.approvalDecision.create({ data: { approvalRequestId: historical.id, status: "APPROVED", note: "Looks scoped." } });

  await prisma.promptTemplate.createMany({
    data: [
      { title: "Build feature", body: "Build {feature}. Include data model, UI, server validation, tests, and edge cases.", tags: ["build"], isGlobal: true },
      { title: "Fix bug", body: "Reproduce and fix {bug}. Explain root cause, add regression coverage, and keep changes scoped.", tags: ["fix"], isGlobal: true },
      { title: "Review code", body: "Review the current diff for correctness, security, UX regressions, and missing tests.", tags: ["review"], isGlobal: true },
      { title: "Continue from last context", body: "Continue the current thread from the latest run state and pending approvals.", tags: ["prompt-only"], projectId: workspace.id },
      { title: "Write tests", body: "Add focused tests for {module}. Cover success, failure, and persistence behavior.", tags: ["tests"], isGlobal: true }
    ]
  });

  await prisma.artifact.createMany({
    data: [
      { projectId: workspace.id, threadId: threadA.id, type: "DOCUMENT", title: "Approval workflow spec", content: "Approval objects are first-class, auditable, and linked to runs.", tags: ["approval", "architecture"] },
      { projectId: workspace.id, threadId: threadB.id, type: "CODE_SNIPPET", title: "Billing service contract", content: "getPlanLimits(planId): Promise<PlanLimits>", tags: ["billing"] },
      { projectId: mobile.id, threadId: threadC.id, type: "NOTE", title: "Mobile composer notes", content: "Use safe-area padding and avoid hidden submit states.", tags: ["mobile", "ux"] }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: "APPROVAL_PENDING", title: "5 approvals waiting", body: "Atlas Control Plane is paused until you decide." },
      { userId: user.id, type: "RUN_FAILED", title: "Offline composer sync failed", body: "Browser adapter validation needs attention." }
    ]
  });

  await prisma.appSetting.createMany({
    data: [
      { userId: user.id, key: "theme", value: "system" },
      { userId: user.id, key: "approvalNotifications", value: { browser: true, banner: true, sound: false } }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

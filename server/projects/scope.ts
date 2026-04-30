import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const activeProjectCookieName = "codex-companion-active-project";

export async function getActiveProjectId(projectId?: string | null) {
  if (projectId) return projectId;
  const cookieStore = await cookies();
  const cookieProjectId = cookieStore.get(activeProjectCookieName)?.value;
  if (cookieProjectId) return cookieProjectId;

  const latestProject = await prisma.project.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { lastActiveAt: "desc" },
    select: { id: true }
  });
  return latestProject?.id ?? null;
}

export async function getActiveProject(projectId?: string | null) {
  const activeProjectId = await getActiveProjectId(projectId);
  if (!activeProjectId) return null;

  const project = await prisma.project.findFirst({
    where: {
      id: activeProjectId,
      status: "ACTIVE"
    }
  });

  if (project) return project;

  return prisma.project.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { lastActiveAt: "desc" }
  });
}

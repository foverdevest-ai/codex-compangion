import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { FolderKanban, MessagesSquare, ShieldCheck, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionMenu } from "@/components/auth/session-menu";
import { authOptions } from "@/server/auth/options";
import { isAllowedUser } from "@/server/auth/config";
import { getActiveProject } from "@/server/projects/scope";

const nav = [
  ["Projects", "/projects", FolderKanban],
  ["Threads", "/threads", MessagesSquare],
  ["Approvals", "/approvals", ShieldCheck]
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions).catch(() => null);
  const isAllowedSession = isAllowedUser(session?.user?.email);

  if (!isAllowedSession) {
    return <>{children}</>;
  }

  const activeProject = await getActiveProject().catch(() => null);
  const projectQuery = activeProject ? `?project=${activeProject.id}` : "";
  const pendingApprovals = activeProject
    ? await prisma.approvalRequest.count({ where: { status: "PENDING", projectId: activeProject.id } }).catch(() => 0)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-[var(--color-glass-bg)] px-4 py-5 shadow-[var(--glass-elevation)] backdrop-blur-[var(--glass-blur)] lg:block">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/projects" className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">Codex Companion</Link>
          {pendingApprovals > 0 ? <Badge tone="amber">{pendingApprovals}</Badge> : null}
        </div>
        {activeProject ? (
          <div className="mb-4 rounded-[var(--radius-md)] border bg-white/60 p-3 text-sm dark:bg-white/5">
            <div className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Active project</div>
            <div className="mt-1 truncate font-semibold">{activeProject.name}</div>
          </div>
        ) : null}
        <nav className="space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={label === "Projects" ? href : `${href}${projectQuery}`} className="flex h-10 items-center gap-3 rounded-[var(--radius-pill)] px-3 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-white/70 hover:text-[var(--foreground)] dark:hover:bg-white/10">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {label === "Approvals" && pendingApprovals > 0 ? <Badge tone="amber" className="ml-auto">{pendingApprovals}</Badge> : null}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="safe-top sticky top-0 z-20 border-b bg-[var(--color-glass-bg)] px-3 py-3 backdrop-blur-[var(--glass-blur)] sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/projects" className="min-w-0 truncate font-[family-name:var(--font-heading)] font-semibold lg:hidden">Codex Companion</Link>
            <div className="hidden text-sm text-[var(--muted-foreground)] lg:block">{activeProject ? `${activeProject.name} cockpit` : "Project-focused coding cockpit"}</div>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild size="sm" className="px-3">
                <Link href={`/threads${projectQuery}`}><PlusCircle className="h-4 w-4" /> Compose</Link>
              </Button>
              {session?.user ? <SessionMenu email={session.user.email} /> : null}
            </div>
          </div>
          {activeProject ? (
            <Link href="/projects" className="mt-2 flex min-h-11 items-center justify-between rounded-[var(--radius-md)] border bg-white/70 px-3 py-2 text-xs dark:bg-white/5 lg:hidden">
              <span className="min-w-0">
                <span className="block font-semibold uppercase text-[var(--muted-foreground)]">Active project</span>
                <span className="block truncate text-sm font-semibold text-[var(--foreground)]">{activeProject.name}</span>
              </span>
              <span className="ml-3 shrink-0 font-semibold text-[var(--color-primary-hover)]">Switch</span>
            </Link>
          ) : null}
        </header>

        {pendingApprovals > 0 ? (
          <Link href={`/approvals${projectQuery}`} className="sticky top-[104px] z-10 block border-b border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-hover)] dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 lg:top-[57px]">
            {pendingApprovals} approval{pendingApprovals === 1 ? "" : "s"} waiting. Review now to resume paused runs.
          </Link>
        ) : null}

        <main className="mobile-bottom-nav-offset mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-[var(--color-glass-bg)] px-2 py-2 shadow-[var(--glass-elevation)] backdrop-blur-[var(--glass-blur)] lg:hidden">
        {nav.map(([label, href, Icon]) => (
          <Link key={href} href={label === "Projects" ? href : `${href}${projectQuery}`} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <span className="relative">
              <Icon className="h-5 w-5" />
              {label === "Approvals" && pendingApprovals > 0 ? <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">{pendingApprovals}</span> : null}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

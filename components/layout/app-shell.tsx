import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Home, FolderKanban, MessagesSquare, Inbox, ShieldCheck, ScrollText, Activity, FileCode2, Settings, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionMenu } from "@/components/auth/session-menu";
import { authOptions } from "@/server/auth/options";
import { isAllowedUser } from "@/server/auth/config";

const nav = [
  ["Home", "/", Home],
  ["Projects", "/projects", FolderKanban],
  ["Threads", "/threads", MessagesSquare],
  ["Inbox", "/inbox", Inbox],
  ["Approvals", "/approvals", ShieldCheck],
  ["Templates", "/templates", ScrollText],
  ["Runs", "/runs", Activity],
  ["Artifacts", "/artifacts", FileCode2],
  ["Settings", "/settings", Settings]
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions).catch(() => null);
  const isAllowedSession = isAllowedUser(session?.user?.email);

  if (!isAllowedSession) {
    return <>{children}</>;
  }

  const pendingApprovals = await prisma.approvalRequest.count({ where: { status: "PENDING" } }).catch(() => 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-[var(--color-glass-bg)] px-4 py-5 shadow-[var(--glass-elevation)] backdrop-blur-[var(--glass-blur)] lg:block">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">Codex Companion</Link>
          {pendingApprovals > 0 ? <Badge tone="amber">{pendingApprovals}</Badge> : null}
        </div>
        <nav className="space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex h-10 items-center gap-3 rounded-[var(--radius-pill)] px-3 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-white/70 hover:text-[var(--foreground)] dark:hover:bg-white/10">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {label === "Approvals" && pendingApprovals > 0 ? <Badge tone="amber" className="ml-auto">{pendingApprovals}</Badge> : null}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-[var(--color-glass-bg)] px-4 py-3 backdrop-blur-[var(--glass-blur)]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-[family-name:var(--font-heading)] font-semibold lg:hidden">Codex Companion</Link>
            <div className="hidden text-sm text-[var(--muted-foreground)] lg:block">Approval-first coding cockpit</div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/threads"><PlusCircle className="h-4 w-4" /> Compose</Link>
              </Button>
              {session?.user ? <SessionMenu email={session.user.email} /> : null}
            </div>
          </div>
        </header>

        {pendingApprovals > 0 ? (
          <Link href="/approvals" className="sticky top-[57px] z-10 block border-b border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-hover)] dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
            {pendingApprovals} approval{pendingApprovals === 1 ? "" : "s"} waiting. Review now to resume paused runs.
          </Link>
        ) : null}

        <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-[var(--color-glass-bg)] px-2 py-2 shadow-[var(--glass-elevation)] backdrop-blur-[var(--glass-blur)] lg:hidden safe-bottom">
        {nav.filter(([label]) => ["Home", "Threads", "Approvals", "Inbox"].includes(label)).map(([label, href, Icon]) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
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

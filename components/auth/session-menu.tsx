"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SessionMenu({ email }: { email?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-52 truncate text-xs text-[var(--muted-foreground)] sm:inline">{email}</span>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const activeRunStates = new Set(["QUEUED", "RUNNING", "WAITING_APPROVAL"]);

export function ThreadAutoRefresh({ runStatus }: { runStatus?: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (!runStatus || !activeRunStates.has(runStatus)) return;
    const interval = window.setInterval(() => router.refresh(), 3000);
    return () => window.clearInterval(interval);
  }, [router, runStatus]);

  return null;
}

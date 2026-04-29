import Link from "next/link";
import type { ApprovalRequest } from "@prisma/client";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/layout/status-badges";

export function ApprovalInlineBanner({ approval }: { approval: ApprovalRequest }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5" />
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{approval.title}</span><RiskBadge risk={approval.riskLevel} /></div>
            <div className="mt-1 text-sm opacity-85">{approval.summary}</div>
          </div>
        </div>
        <Button asChild size="sm"><Link href={`/approvals?selected=${approval.id}`}>Review</Link></Button>
      </div>
    </div>
  );
}

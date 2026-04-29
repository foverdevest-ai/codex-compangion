import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-transparent text-[var(--color-gray-600)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] dark:text-[var(--foreground)]",
  blue: "bg-[var(--color-accent-light)] text-[var(--color-info)]",
  amber: "bg-[var(--color-warning-surface)] text-[var(--color-primary-hover)] border border-[var(--color-warning-border)]",
  green: "bg-[var(--color-success-surface)] text-[var(--color-success)]",
  red: "bg-red-50 text-[var(--color-error)] border border-red-200 dark:bg-red-950/40 dark:border-red-900"
};

export function Badge({ className, tone = "neutral", children }: { className?: string; tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

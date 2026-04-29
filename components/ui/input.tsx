import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-input)] px-4 text-sm text-[var(--color-gray-700)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--color-focus)] dark:text-[var(--foreground)]", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-24 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-input)] px-4 py-3 text-sm text-[var(--color-gray-700)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--color-focus)] dark:text-[var(--foreground)]", className)} {...props} />;
}

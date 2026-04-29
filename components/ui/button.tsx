import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm font-semibold font-[family-name:var(--font-body)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-action-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-action-primary-hover)]",
        secondary: "border border-white bg-[var(--color-glass-dark)] text-white shadow-[var(--glass-elevation)] hover:bg-[var(--color-gray-900)]",
        outline: "border border-[var(--color-border)] bg-transparent text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] dark:text-[var(--foreground)] dark:hover:bg-[var(--muted)]",
        destructive: "bg-[var(--destructive)] text-white hover:opacity-90",
        ghost: "text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] dark:text-[var(--foreground)] dark:hover:bg-[var(--muted)]"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

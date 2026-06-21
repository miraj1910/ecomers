import { cn } from "@/lib/utils"

const variants = {
  default: "bg-border-subtle text-text-primary",
  secondary: "bg-bg-surface text-text-secondary border border-border-subtle",
  new: "bg-border-subtle text-text-primary",
  sale: "bg-text-primary/5 text-text-primary",
  success: "bg-success/5 text-success",
  destructive: "bg-error/5 text-error",
  outline: "border border-border-subtle text-text-secondary",
} as const

const sizes = {
  sm: "px-2.5 py-1 text-[0.625rem] tracking-[0.08em] uppercase",
  md: "px-3 py-1.5 text-[0.6875rem] tracking-[0.08em] uppercase",
  lg: "px-4 py-2 text-[0.75rem] tracking-[0.08em] uppercase",
} as const

interface BadgeProps {
  children: React.ReactNode
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  className?: string
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

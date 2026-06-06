import { cn } from "@/lib/utils"

const variants = {
  default: "bg-accent/15 text-accent border border-accent/25",
  secondary: "bg-foreground/[0.06] text-secondary border border-border",
  new: "bg-accent/15 text-accent border border-accent/25",
  sale: "bg-red-500/15 text-sale border border-red-500/25",
  success: "border border-emerald-400/20 bg-emerald-400/12 text-emerald-300",
  destructive: "border border-red-400/20 bg-red-400/12 text-red-300",
  outline: "border border-border text-foreground/80",
} as const

const sizes = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
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
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

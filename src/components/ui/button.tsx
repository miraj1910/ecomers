import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-text-primary text-white hover:bg-accent-hover",
  secondary:
    "bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-warm",
  outline:
    "border border-border-subtle bg-transparent text-text-primary hover:bg-bg-warm",
  ghost:
    "text-text-secondary hover:text-text-primary",
  link:
    "text-text-primary underline-offset-4 hover:underline",
} as const

const sizes = {
  sm: "h-9 px-4 text-[0.7rem] tracking-[0.1em] uppercase",
  md: "h-11 px-6 text-[0.7rem] tracking-[0.1em] uppercase",
  lg: "h-14 px-8 text-[0.75rem] tracking-[0.12em] uppercase",
  xl: "h-16 px-10 text-[0.8rem] tracking-[0.12em] uppercase",
  icon: "h-10 w-10",
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-text-primary disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"

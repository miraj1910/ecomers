import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  default:
    "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-foreground/[0.06]",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-foreground/[0.06]",
  ghost:
    "text-secondary hover:bg-foreground/[0.06] hover:text-foreground",
  link:
    "text-accent underline-offset-4 hover:underline",
} as const

const sizes = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-base",
  icon: "h-10 w-10",
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"

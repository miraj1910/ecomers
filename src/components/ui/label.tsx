import { cn } from "@/lib/utils"
import type { LabelHTMLAttributes } from "react"

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-text-secondary", className)}
      {...props}
    >
      {children}
    </label>
  )
}

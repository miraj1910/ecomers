import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  as?: "div" | "article" | "button"
  onClick?: () => void
}

export function Card({
  children,
  className,
  as: Tag = "div",
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-border",
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  )
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  )
}

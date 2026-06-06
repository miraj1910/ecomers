"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: "sm" | "md"
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
}: QuantitySelectorProps) {
  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-foreground/[0.05]",
        disabled && "opacity-50"
      )}
    >
      <button
        onClick={() => onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center text-secondary transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
      >
        <Minus className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10)
          if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)))
        }}
        disabled={disabled}
        aria-label="Quantity"
        className={cn(
          "w-10 border-x border-border bg-transparent text-center font-medium tabular-nums text-foreground focus:outline-none",
          size === "sm" ? "h-7 text-xs" : "h-9 text-sm"
        )}
      />

      <button
        onClick={() => onChange(value + 1)}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center text-secondary transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
      >
        <Plus className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </div>
  )
}

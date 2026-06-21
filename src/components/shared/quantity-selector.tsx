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
        "inline-flex items-center border border-border-subtle",
        disabled && "opacity-50"
      )}
    >
      <button
        onClick={() => onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center text-text-secondary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-30",
          size === "sm" ? "h-8 w-8" : "h-11 w-11"
        )}
      >
        <Minus className="h-3.5 w-3.5" />
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
          "w-12 border-x border-border-subtle bg-transparent text-center font-medium tabular-nums text-text-primary focus:outline-none",
          size === "sm" ? "h-8 text-xs" : "h-11 text-sm"
        )}
      />

      <button
        onClick={() => onChange(value + 1)}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center text-text-secondary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-30",
          size === "sm" ? "h-8 w-8" : "h-11 w-11"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

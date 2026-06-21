"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
}

const sizeMap = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" }

export function StarRating({
  rating,
  maxRating = 5,
  size = "sm",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)

  if (interactive) {
    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="transition-colors hover:text-accent focus:outline-none"
          >
            <Star
              className={cn(
                sizeMap[size],
                star <= rating
                  ? "fill-accent text-accent"
                  : "fill-none text-secondary/30"
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= rating
              ? "fill-accent text-accent"
              : "fill-none text-secondary/30"
          )}
        />
      ))}
    </div>
  )
}

export function RatingDistribution({
  distribution,
  total,
}: {
  distribution: number[]
  total: number
}) {
  const maxCount = Math.max(...distribution, 1)

  return (
    <div className="space-y-1.5">
      {distribution.map((count, i) => {
        const star = i + 1
        const pct = total > 0 ? (count / maxCount) * 100 : 0

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right text-secondary">{star}</span>
            <Star className="h-3 w-3 fill-accent text-accent" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right text-secondary">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

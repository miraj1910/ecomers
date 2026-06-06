"use client"

import { useState } from "react"
import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, User } from "lucide-react"
import { deleteReview } from "@/actions/reviews"
import type { ReviewItem } from "@/types/prisma"

interface ReviewCardProps {
  review: ReviewItem
  isOwn?: boolean
  onEdit?: (review: ReviewItem) => void
  onDeleted?: (id: string) => void
}

export function ReviewCard({ review, isOwn, onEdit, onDeleted }: ReviewCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm("Delete this review?")) return
    setDeleting(true)
    setError(null)
    const result = await deleteReview(review.id)
    if (result.success) {
      onDeleted?.(review.id)
    } else {
      setError(result.error ?? "Failed to delete")
    }
    setDeleting(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/[0.08]">
            {review.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.image}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-secondary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {review.user.name ?? "Anonymous"}
            </p>
            <p className="text-xs text-secondary">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {isOwn && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit?.(review)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="mt-2 text-sm font-medium">{review.title}</p>
      )}

      {review.comment && (
        <p className="mt-1 text-sm text-secondary leading-relaxed">
          {review.comment}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

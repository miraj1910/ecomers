"use client"

import { useState } from "react"
import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createReview, updateReview } from "@/actions/reviews"
import { cn } from "@/lib/utils"
import type { ReviewItem, ReviewInput } from "@/types/prisma"

interface ReviewFormProps {
  productId: string
  existingReview?: ReviewItem | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [title, setTitle] = useState(existingReview?.title ?? "")
  const [comment, setComment] = useState(existingReview?.comment ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!existingReview

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setSubmitting(true)
    setError(null)

    if (isEditing) {
      const result = await updateReview(existingReview!.id, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      })
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error ?? "Failed to update review")
      }
    } else {
      const input: ReviewInput = {
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      }
      const result = await createReview(input)
      if (result.success) {
        onSuccess?.()
        setRating(0)
        setTitle("")
        setComment("")
      } else {
        setError(result.error ?? "Failed to submit review")
      }
    }

    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Rating</label>
        <StarRating rating={rating} size="md" interactive onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="mb-1 block text-sm font-medium">
          Title (optional)
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your review"
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1 block text-sm font-medium">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience"
          rows={4}
          maxLength={1000}
          className={cn(
            "flex w-full rounded-xl border border-border bg-foreground/[0.07] px-3 py-2 text-sm text-foreground ring-offset-background backdrop-blur-xl",
            "placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]"
          )}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

"use client"

import { useState, useEffect, useTransition } from "react"
import { ReviewCard } from "@/components/reviews/review-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getProductReviews } from "@/actions/reviews"
import type { ReviewItem } from "@/types/prisma"

interface ReviewListProps {
  productId: string
  currentUserId?: string | null
  refreshKey?: number
}

export function ReviewList({ productId, currentUserId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    startTransition(() => setLoading(true))
    getProductReviews(productId, page).then((data) => {
      if (cancelled) return
      startTransition(() => {
        setReviews(data.reviews)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setLoading(false)
      })
    })
    return () => { cancelled = true }
  }, [productId, page, refreshKey, startTransition])

  const handleDeleted = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setTotal((prev) => prev - 1)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-foreground/[0.08]" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-foreground/[0.035] p-8 text-center">
        <p className="text-sm text-secondary">No reviews yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        {total} {total === 1 ? "review" : "reviews"}
      </p>

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwn={review.userId === currentUserId}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

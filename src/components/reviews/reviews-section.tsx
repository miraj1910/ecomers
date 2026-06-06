"use client"

import { useState, useEffect } from "react"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewList } from "@/components/reviews/review-list"
import { ProductRatingSummary } from "@/components/reviews/product-rating-summary"
import { getUserReview } from "@/actions/reviews"
import { getProductRating } from "@/actions/reviews"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import type { ReviewItem, ProductRatingSummary as RatingSummary } from "@/types/prisma"

interface ReviewsSectionProps {
  productId: string
  currentUserId?: string | null
}

export function ReviewsSection({ productId, currentUserId }: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null)
  const [userReview, setUserReview] = useState<ReviewItem | null>(null)
  const [rating, setRating] = useState<RatingSummary | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getProductRating(productId).then(setRating)
    if (currentUserId) {
      getUserReview(productId).then((res) => {
        if (res.success && res.data) setUserReview(res.data)
      })
    }
  }, [productId, currentUserId, refreshKey])

  const handleSuccess = () => {
    setShowForm(false)
    setEditingReview(null)
    setRefreshKey((k) => k + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingReview(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-secondary" />
          <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
        </div>
        {currentUserId && !userReview && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      <ProductRatingSummary rating={rating} />

      {rating && rating.totalRatings > 0 && (
        <div className="border-t border-border pt-6">
          <ReviewList
            productId={productId}
            currentUserId={currentUserId}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {rating && rating.totalRatings === 0 && (
        <div className="border-t border-border pt-6">
          <ReviewList
            productId={productId}
            currentUserId={currentUserId}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-border bg-surface rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-medium">
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {currentUserId && userReview && !showForm && (
        <div className="rounded-2xl border border-border bg-foreground/[0.04] p-4 text-center text-sm text-secondary">
          You have reviewed this product.{" "}
          <button
            onClick={() => setShowForm(true)}
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            Edit your review
          </button>
        </div>
      )}
    </div>
  )
}

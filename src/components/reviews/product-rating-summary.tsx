import { StarRating, RatingDistribution } from "@/components/reviews/star-rating"
import type { ProductRatingSummary } from "@/types/prisma"

interface ProductRatingSummaryProps {
  rating: ProductRatingSummary | null
}

export function ProductRatingSummary({ rating }: ProductRatingSummaryProps) {
  if (!rating || rating.totalRatings === 0) {
    return (
      <div className="flex items-center gap-2">
        <StarRating rating={0} size="sm" />
        <span className="text-xs text-secondary">No reviews yet</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
        <span className="text-4xl font-bold">
          {rating.averageRating.toFixed(1)}
        </span>
        <StarRating rating={Math.round(rating.averageRating)} size="sm" />
        <span className="text-xs text-secondary">
          {rating.totalRatings} {rating.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>
      <div className="flex-1">
        <RatingDistribution
          distribution={rating.distribution}
          total={rating.totalRatings}
        />
      </div>
    </div>
  )
}

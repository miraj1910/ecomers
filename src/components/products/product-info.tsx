import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/reviews/star-rating"
import { formatPrice } from "@/lib/utils"

interface ProductInfoProps {
  name: string
  description: string | null | undefined
  price: number
  comparePrice: number | null | undefined
  category: { _id: string; title: string; slug: string } | null | undefined
  tags: string[] | null | undefined
  stock: number | null | undefined
  rating?: { averageRating: number; totalRatings: number } | null
}

export function ProductInfo({
  name,
  description,
  price,
  comparePrice,
  category,
  tags,
  stock,
  rating,
}: ProductInfoProps) {
  const inStock = (stock ?? 0) > 0

  return (
    <div>
      {category && (
        <Link
          href={`/products?category=${category.slug}`}
          className="text-xs text-secondary hover:text-foreground transition-colors uppercase tracking-wider"
        >
          {category.title}
        </Link>
      )}

      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {name}
      </h1>

      {description && (
        <p className="mt-4 text-sm text-secondary leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-2xl font-semibold">
          {formatPrice(price, { notation: "standard" })}
        </span>
        {comparePrice && comparePrice > price && (
          <>
            <span className="text-lg text-secondary line-through">
              {formatPrice(comparePrice, { notation: "standard" })}
            </span>
            <Badge variant="destructive" size="sm">
              {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
            </Badge>
          </>
        )}
      </div>

      {rating && rating.totalRatings > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <StarRating rating={Math.round(rating.averageRating)} size="sm" />
          <span className="text-xs text-secondary">
            {rating.averageRating.toFixed(1)} ({rating.totalRatings})
          </span>
        </div>
      )}

      <div className="mt-4">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            In stock
            {stock != null && stock < 10 && ` (${stock} left)`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Out of stock
          </span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

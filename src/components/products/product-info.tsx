import Link from "next/link"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null

  return (
    <div>
      {category && (
        <Link
          href={`/products?category=${category.slug}`}
          className="meta hover:text-text-primary transition-colors"
        >
          {category.title}
        </Link>
      )}

      <h1 className="mt-4 heading-hero text-text-primary">
        {name}
      </h1>

      {description && (
        <p className="mt-6 text-base leading-relaxed text-text-secondary max-w-lg">
          {description}
        </p>
      )}

      <div className="mt-8 flex items-baseline gap-4">
        <span className="text-3xl font-serif text-text-primary">
          ${price.toFixed(0)}
        </span>
        {comparePrice && comparePrice > price && (
          <>
            <span className="text-xl text-text-muted line-through">
              ${comparePrice.toFixed(0)}
            </span>
            <span className="text-[0.6rem] font-medium tracking-[0.1em] uppercase text-text-primary bg-text-primary/5 px-2.5 py-1">
              {discount}% off
            </span>
          </>
        )}
      </div>

      {rating && rating.totalRatings > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.round(rating.averageRating)
                    ? "fill-text-primary text-text-primary"
                    : "text-border-subtle"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            {rating.averageRating.toFixed(1)} ({rating.totalRatings})
          </span>
        </div>
      )}

      <div className="mt-6">
        {inStock ? (
          <span className="text-xs text-success">
            In stock
          </span>
        ) : (
          <span className="text-xs text-text-secondary">
            Out of stock
          </span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-[0.6rem] font-medium tracking-[0.08em] uppercase text-text-secondary bg-border-subtle px-3 py-1.5">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

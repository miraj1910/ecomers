"use client"

import Image from "next/image"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ProductCardData } from "@/types"

interface ProductCardProps {
  product: ProductCardData
  onAddToCart?: (product: ProductCardData) => void
  onToggleWishlist?: (product: ProductCardData) => void
  isWishlisted?: boolean
  className?: string
  aspectRatio?: "4/5" | "1/1" | "3/4"
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className,
  aspectRatio = "4/5",
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const aspectClass = {
    "4/5": "aspect-[4/5]",
    "1/1": "aspect-square",
    "3/4": "aspect-[3/4]",
  }[aspectRatio]

  return (
    <article
      className={cn(
        "group relative flex flex-col bg-transparent",
        className
      )}
    >
      <div className={cn("relative overflow-hidden bg-[#E5DDD2]", aspectClass)}>
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-foreground/[0.03]" />
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {product.badge && (
          <span
            className={cn(
              "editorial-kicker absolute left-3 top-3 inline-flex items-center bg-surface/85 px-2.5 py-1",
              product.badge === "Sale" || product.badge === "sale"
                ? "text-sale"
                : "text-foreground"
            )}
          >
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <span className="editorial-kicker text-foreground">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {onToggleWishlist && (
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist(product)
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="h-8 w-8 rounded-full border-border bg-surface/85 backdrop-blur-sm hover:bg-background"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted && "fill-sale text-sale"
                )}
              />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <p className="editorial-kicker text-muted">{product.category}</p>

        <h3 className="max-w-full break-words text-[0.72rem] font-bold uppercase leading-5 tracking-[0.16em] text-foreground [overflow-wrap:anywhere]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-star text-star" />
          <span className="text-xs text-muted">
            {product.rating}
            {product.reviewCount && product.reviewCount > 0 && (
              <> ({product.reviewCount})</>
            )}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-secondary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {onAddToCart && product.inStock !== false && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                onAddToCart(product)
              }}
              aria-label="Add to cart"
              className="h-8 w-8 rounded-full text-secondary hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

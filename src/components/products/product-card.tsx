"use client"

import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
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
      <div className={cn("product-image-container relative", aspectClass)}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-bg-secondary" />
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            "object-cover",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {product.badge && (
          <span className="absolute left-4 top-4 text-[0.55rem] font-medium tracking-[0.15em] uppercase text-text-primary bg-white/90 px-3 py-1.5">
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60">
            <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-text-primary">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist(product)
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-9 w-9 items-center justify-center bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted ? "fill-text-primary text-text-primary" : "text-text-secondary"
                )}
              />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-5">
        <p className="meta">{product.category}</p>

        <h3 className="heading-product text-text-primary max-w-full break-words [overflow-wrap:anywhere]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">
              ${product.price.toFixed(0)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-text-muted line-through">
                ${product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          {onAddToCart && product.inStock !== false && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onAddToCart(product)
              }}
              aria-label="Add to cart"
              className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

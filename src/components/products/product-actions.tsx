"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/shared/quantity-selector"
import { useCart, addToServerCart } from "@/store/cart"
import {
  useWishlist,
  addToServerWishlist,
  removeFromServerWishlist,
} from "@/store/wishlist"
import { useToast } from "@/hooks/use-toast"

interface ProductActionsProps {
  productId: string
  slug?: string
  name: string
  price: number
  image: string
  sizes: string[] | null | undefined
  inStock: boolean
}

export function ProductActions({
  productId,
  slug,
  name,
  price,
  image,
  sizes,
  inStock,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { data: session } = useSession()

  const addItem = useCart((s) => s.addItem)
  const { isWishlisted, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlist()
  const { success } = useToast()
  const isAuth = !!session?.user?.id

  const wishlisted = isWishlisted(productId)

  async function handleWishlistToggle() {
    if (wishlisted) {
      if (isAuth) {
        await removeFromServerWishlist(productId)
      }
      removeWishlistItem(productId)
      success("Removed from wishlist", `${name} has been removed from your wishlist.`)
    } else {
      if (isAuth) {
        await addToServerWishlist(productId)
      }
      addWishlistItem({
        productId,
        name,
        slug: slug ?? "",
        price,
        image,
      })
      success("Added to wishlist", `${name} has been added to your wishlist.`)
    }
  }

  async function handleAddToCart() {
    const item = {
      productId,
      name,
      price,
      quantity,
      image,
      size: selectedSize ?? undefined,
    }
    if (isAuth) {
      await addToServerCart(item)
    } else {
      addItem(item)
    }
    success("Added to cart", `${name} has been added to your cart.`)
  }

  return (
    <div>
      {sizes && sizes.length > 0 && (
        <div>
          <h3 className="meta">
            Size
            {selectedSize && (
              <span className="text-text-primary ml-2">{selectedSize}</span>
            )}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex h-12 w-14 items-center justify-center text-sm font-medium transition-all duration-300",
                  selectedSize === size
                    ? "bg-text-primary text-white"
                    : "bg-transparent text-text-primary border border-border-subtle hover:border-text-primary"
                )}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="meta">Quantity</h3>
        <div className="mt-3">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
            disabled={!inStock}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          disabled={!inStock}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>

        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="flex h-14 w-14 items-center justify-center border border-border-subtle transition-colors hover:bg-bg-warm"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              wishlisted && "fill-text-primary text-text-primary"
            )}
          />
        </button>
      </div>
    </div>
  )
}

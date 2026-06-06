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
          <h3 className="text-sm font-medium">
            Size
            {selectedSize && (
              <span className="text-secondary font-normal ml-1">
                — {selectedSize}
              </span>
            )}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex h-10 w-14 items-center justify-center rounded-lg border text-sm font-medium transition-all",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                )}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-medium">Quantity</h3>
        <div className="mt-2">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
            disabled={!inStock}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          disabled={!inStock}
          onClick={handleAddToCart}
          className="flex-1 gap-2"
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="w-full sm:w-auto"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted && "fill-red-500 text-red-500"
            )}
          />
        </Button>
      </div>
    </div>
  )
}

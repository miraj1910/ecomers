"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import { WaterDroplet } from "@/components/droplets"
import {
  useWishlist,
  fetchServerWishlist,
  removeFromServerWishlist,
} from "@/store/wishlist"

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const { items, removeItem, clearWishlist, setItems } = useWishlist()
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (status !== "authenticated") return
    if (fetchedRef.current) return
    fetchedRef.current = true

    fetchServerWishlist().then((serverItems) => {
      setItems(serverItems)
    })
  }, [status, setItems])

  async function handleRemove(productId: string) {
    if (session?.user?.id) {
      await removeFromServerWishlist(productId)
    }
    removeItem(productId)
  }

  async function handleClearAll() {
    if (session?.user?.id) {
      for (const item of items) {
        await removeFromServerWishlist(item.productId)
      }
    }
    clearWishlist()
  }

  const displayItems = items

  return (
    <Section>
      <Container>
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="meta">Saved</span>
            <h1 className="heading-section mt-2 text-text-primary">Wishlist</h1>
            <p className="mt-2 text-sm text-text-secondary">
              {displayItems.length} {displayItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {displayItems.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <WaterDroplet size="md" />
            <h2 className="heading-product mt-5 text-text-primary">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Save items you love to your wishlist
            </p>
            <Link href="/products">
              <Button variant="secondary" className="mt-6">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayItems.map((item) => (
              <div
                key={item.productId}
                className="group relative"
              >
                <Link href={`/products/${item.slug}`}>
                  <div className="product-image-container relative aspect-[4/5]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name || "Product"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-secondary">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center bg-white/90 text-text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mt-5 space-y-2">
                  <h3 className="heading-product text-text-primary">
                    {item.name || `Product #${item.productId.slice(0, 8)}`}
                  </h3>
                  {item.price > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">
                        ${item.price.toFixed(0)}
                      </span>
                      {item.comparePrice && (
                        <span className="text-sm text-text-muted line-through">
                          ${item.comparePrice.toFixed(0)}
                        </span>
                      )}
                    </div>
                  )}
                  <Link href={`/products/${item.slug || `?id=${item.productId}`}`}>
                    <Button size="sm" variant="secondary" className="mt-2">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

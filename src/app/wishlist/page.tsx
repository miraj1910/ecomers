"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2, ShoppingBag } from "lucide-react"
import { useSession } from "next-auth/react"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import {
  useWishlist,
  fetchServerWishlist,
  removeFromServerWishlist,
} from "@/store/wishlist"
import { formatPrice } from "@/lib/utils"

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Wishlist</h1>
            <p className="mt-1 text-sm text-secondary">
              {displayItems.length} {displayItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {displayItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="bg-surface border border-border flex flex-col items-center justify-center rounded-3xl py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] mb-4">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-white">Your wishlist is empty</h2>
            <p className="mt-1 text-sm text-secondary">
              Save items you love to your wishlist
            </p>
            <Link href="/products">
              <Button variant="outline" className="mt-6 gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayItems.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-border bg-surface group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              >
                <Link href={`/products/${item.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name || "Product"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-secondary">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-black/45 text-secondary opacity-0 transition-opacity hover:text-white group-hover:opacity-100 backdrop-blur-sm"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="p-4">
                  <p className="text-xs text-accent/75 mb-1">Product</p>
                  <h3 className="text-sm font-semibold text-white">
                    {item.name || `Product #${item.productId.slice(0, 8)}`}
                  </h3>
                  {item.price > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-accent">
                        {formatPrice(item.price)}
                      </span>
                      {item.comparePrice && (
                        <span className="text-xs text-secondary line-through">
                          {formatPrice(item.comparePrice)}
                        </span>
                      )}
                    </div>
                  )}
                  <Link href={`/products/${item.slug || `?id=${item.productId}`}`}>
                    <Button size="sm" className="mt-3 w-full">
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

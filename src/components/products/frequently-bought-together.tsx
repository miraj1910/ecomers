"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart, addToServerCart } from "@/store/cart"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

type CartItem = {
  productId: string
  name: string
  price: number
  image: string
}

type RecommendedItem = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  image: string | null
  stock: number
}

export function FrequentlyBoughtTogether({ items }: { items: CartItem[] }) {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([])
  const [loading, setLoading] = useState(false)
  const addItem = useCart((s) => s.addItem)
  const { data: session } = useSession()
  const isAuth = !!session?.user?.id
  const { success } = useToast()

  const productIds = items.map((i) => i.productId)

  useEffect(() => {
    if (productIds.length === 0) return
    setLoading(true)
    fetch("/api/products/frequently-bought-together", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecommendations(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productIds.join(",")])

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
      </div>
    )
  }

  if (recommendations.length === 0) return null

  const handleAddAll = async () => {
    for (const rec of recommendations) {
      if (rec.stock <= 0) continue
      const cartItem = {
        productId: rec.id,
        name: rec.name,
        price: rec.price,
        quantity: 1,
        image: rec.image ?? "",
      }
      if (isAuth) {
        await addToServerCart(cartItem)
      } else {
        addItem(cartItem)
      }
    }
    success("Added to cart", "Recommended items have been added to your cart.")
  }

  return (
    <div className="border-t border-border-subtle px-4 py-4">
      <h3 className="text-sm font-serif text-text-primary mb-3">
        Frequently Bought Together
      </h3>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/products/${rec.slug}`}
            className="flex items-center gap-3 border border-border-subtle p-2 transition-colors hover:bg-bg-warm"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-bg-secondary">
              {rec.image ? (
                <Image
                  src={rec.image}
                  alt={rec.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-text-muted">
                  No img
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-text-primary">
                {rec.name}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                ${rec.price.toFixed(2)}
              </p>
            </div>
            {rec.stock > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={async (e) => {
                  e.preventDefault()
                  const cartItem = {
                    productId: rec.id,
                    name: rec.name,
                    price: rec.price,
                    quantity: 1,
                    image: rec.image ?? "",
                  }
                  if (isAuth) {
                    await addToServerCart(cartItem)
                  } else {
                    addItem(cartItem)
                  }
                  success("Added to cart", `${rec.name} has been added to your cart.`)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </Link>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-3 w-full gap-2"
        onClick={handleAddAll}
      >
        <ShoppingBag className="h-4 w-4" />
        Add All to Cart
      </Button>
    </div>
  )
}

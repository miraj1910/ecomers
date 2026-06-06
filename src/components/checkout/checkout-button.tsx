"use client"

import { useState } from "react"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const items = useCart((s) => s.items)
  const clearCart = useCart((s) => s.clearCart)

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong")
      }

      clearCart()
      window.location.href = data.url
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
      >
        {loading ? "Redirecting to checkout..." : "Checkout"}
      </Button>
      {error && (
        <p className="text-center text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

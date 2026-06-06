"use client"

import { formatCartPrice } from "@/lib/cart"
import { CheckoutButton } from "@/components/checkout/checkout-button"

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  onCheckout?: () => void
}

export function CartSummary({
  subtotal,
  itemCount,
  onCheckout,
}: CartSummaryProps) {
  return (
    <div className="border-t border-border px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="text-lg font-semibold tabular-nums text-accent">
          {formatCartPrice(subtotal)}
        </span>
      </div>
      <div onClick={onCheckout}>
        <CheckoutButton />
      </div>
      <p className="mt-2 text-center text-xs text-secondary">
        Shipping calculated at checkout
      </p>
    </div>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  onCheckout?: () => void
}

export function CartSummary({ subtotal, itemCount, onCheckout }: CartSummaryProps) {
  const router = useRouter()
  const FREE_SHIPPING_THRESHOLD = 100
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="border-t border-border-subtle px-8 py-6 space-y-4">
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <div className="space-y-2">
          <div className="h-[2px] bg-border-subtle overflow-hidden">
            <div
              className="h-full bg-text-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Add ${remaining.toFixed(0)} more for free shipping
          </p>
        </div>
      )}
      {subtotal >= FREE_SHIPPING_THRESHOLD && (
        <p className="text-xs text-success font-medium">
          You qualify for free shipping!
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Subtotal</span>
        <span className="text-lg font-serif text-text-primary">${subtotal.toFixed(0)}</span>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          onCheckout?.()
          router.push("/checkout/address")
        }}
      >
        Checkout
      </Button>
    </div>
  )
}

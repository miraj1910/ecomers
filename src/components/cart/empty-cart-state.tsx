"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WaterDroplet } from "@/components/droplets"

interface EmptyCartStateProps {
  onContinueShopping?: () => void
}

export function EmptyCartState({
  onContinueShopping,
}: EmptyCartStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8">
      <WaterDroplet size="md" />
      <div className="text-center">
        <p className="text-base font-medium text-text-primary">Your cart is empty</p>
        <p className="mt-1 text-sm text-text-secondary">
          Add items to get started
        </p>
      </div>
      {onContinueShopping && (
        <Button variant="secondary" size="sm" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      )}
    </div>
  )
}

"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyCartStateProps {
  onContinueShopping?: () => void
}

export function EmptyCartState({
  onContinueShopping,
}: EmptyCartStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-foreground/[0.08]">
        <ShoppingBag className="h-6 w-6 text-accent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Your cart is empty</p>
        <p className="mt-1 text-xs text-secondary">
          Add items to get started
        </p>
      </div>
      {onContinueShopping && (
        <Button variant="outline" size="sm" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      )}
    </div>
  )
}

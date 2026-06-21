"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"

export function CheckoutButton() {
  const router = useRouter()
  const items = useCart((s) => s.items)

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push("/checkout/address")}
        disabled={items.length === 0}
      >
        Checkout
      </Button>
    </div>
  )
}

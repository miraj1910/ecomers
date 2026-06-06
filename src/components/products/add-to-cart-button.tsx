"use client"

import { useSession } from "next-auth/react"
import { useCart, addToServerCart } from "@/store/cart"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import type { CartItem } from "@/types"

interface AddToCartButtonProps {
  product: CartItem
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { data: session } = useSession()
  const addItem = useCart((s) => s.addItem)
  const { success } = useToast()
  const isAuth = !!session?.user?.id

  async function handleAdd() {
    if (isAuth) {
      await addToServerCart(product)
    } else {
      addItem(product)
    }
    success("Added to cart", `${product.name} has been added to your cart.`)
  }

  return (
    <Button
      size="lg"
      disabled={disabled}
      onClick={handleAdd}
      className="gap-2"
    >
      <ShoppingBag className="h-4 w-4" />
      {disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}

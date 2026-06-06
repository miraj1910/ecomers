import { useSession } from "next-auth/react"
import { useCart, addToServerCart } from "@/store/cart"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/types"

export function useCartActions() {
  const { data: session } = useSession()
  const isAuth = !!session?.user?.id
  const addItem = useCart((s) => s.addItem)
  const removeItem = useCart((s) => s.removeItem)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const clearCart = useCart((s) => s.clearCart)
  const { success } = useToast()

  async function addWithToast(item: CartItem) {
    if (isAuth) {
      await addToServerCart(item)
    } else {
      addItem(item)
    }
    success("Added to cart", `${item.name} has been added to your cart.`)
  }

  return {
    addItem,
    addWithToast,
    removeItem,
    updateQuantity,
    clearCart,
  }
}

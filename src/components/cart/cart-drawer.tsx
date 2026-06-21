"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { EmptyCartState } from "@/components/cart/empty-cart-state"
import { CartItemRow } from "@/components/cart/cart-item-row"
import { CartSummary } from "@/components/cart/cart-summary"
import { FrequentlyBoughtTogether } from "@/components/products/frequently-bought-together"
import { useCart, removeFromServerCart, updateServerCart } from "@/store/cart"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const { data: session } = useSession()
  const isAuth = !!session?.user?.id
  const items = useCart((s) => s.items)
  const removeItem = useCart((s) => s.removeItem)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const itemCount = useCart((s) => s.itemCount())
  const subtotal = useCart((s) => s.subtotal())
  const error = useCart((s) => s.error)

  const handleRemove = useCallback(async (productId: string) => {
    if (isAuth) {
      await removeFromServerCart(productId)
    } else {
      removeItem(productId)
    }
  }, [isAuth, removeItem])

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (isAuth) {
      await updateServerCart(productId, quantity)
    } else {
      updateQuantity(productId, quantity)
    }
  }, [isAuth, updateQuantity])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    },
    [open, onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [handleEscape])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border-subtle">
              <div>
                <h2 className="font-serif text-2xl font-normal text-text-primary">Cart</h2>
                <p className="text-xs text-text-secondary mt-1">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mx-8 mt-4 px-4 py-3 text-xs text-error bg-error/5">
                {error}
              </div>
            )}

            {items.length === 0 ? (
              <EmptyCartState onContinueShopping={onClose} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <ul className="flex flex-col gap-5">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                        onClose={onClose}
                      />
                    ))}
                  </ul>

                  <FrequentlyBoughtTogether
                    items={items.map((i) => ({
                      productId: i.productId,
                      name: i.name,
                      price: i.price,
                      image: i.image,
                    }))}
                  />
                </div>

                <CartSummary
                  subtotal={subtotal}
                  itemCount={itemCount}
                  onCheckout={onClose}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import {
  useCart,
  fetchServerCart,
  mergeServerCart,
  loadGuestCart,
  saveGuestCart,
  clearGuestCart,
} from "@/store/cart"
import {
  useWishlist,
  fetchServerWishlist,
  loadGuestWishlist,
  saveGuestWishlist,
  clearGuestWishlist,
} from "@/store/wishlist"

export function CartSyncManager() {
  const { data: session, status } = useSession()

  const cartItems = useCart((s) => s.items)
  const setCartItems = useCart((s) => s.setItems)
  const clearCart = useCart((s) => s.clearCart)

  const wishlistItems = useWishlist((s) => s.items)
  const setWishlistItems = useWishlist((s) => s.setItems)
  const clearWishlist = useWishlist((s) => s.clearWishlist)

  const prevUserId = useRef<string | null | undefined>(undefined)
  const mergeAttempted = useRef(false)

  const isAuth = status === "authenticated"
  const isLoading = status === "loading"
  const userId = session?.user?.id

  useEffect(() => {
    if (isLoading) return

    if (isAuth && userId && prevUserId.current !== userId) {
      const guestCart = loadGuestCart()

      const doFetch = () => {
        fetchServerCart().catch(() => {})
        fetchServerWishlist().then((productIds) => {
          setWishlistItems(
            productIds.map((id) => ({
              productId: id,
              name: "",
              slug: "",
              price: 0,
              image: "",
            }))
          )
        }).catch(() => {})
      }

      if (guestCart.length > 0 && !mergeAttempted.current) {
        mergeAttempted.current = true
        mergeServerCart(guestCart).then(() => {
          clearGuestCart()
          clearGuestWishlist()
          fetchServerWishlist().then((productIds) => {
            setWishlistItems(
              productIds.map((id) => ({
                productId: id,
                name: "",
                slug: "",
                price: 0,
                image: "",
              }))
            )
          }).catch(() => {})
        }).catch(() => {
          doFetch()
        })
      } else {
        clearGuestCart()
        clearGuestWishlist()
        doFetch()
      }

      prevUserId.current = userId
      return
    }

    if (!isAuth && prevUserId.current) {
      prevUserId.current = null
      mergeAttempted.current = false
      clearCart()
      clearWishlist()
      return
    }

    if (!isAuth && prevUserId.current === undefined) {
      prevUserId.current = null

      try {
        localStorage.removeItem("cart-storage")
        localStorage.removeItem("wishlist-storage")
      } catch {}

      const guestCart = loadGuestCart()
      if (guestCart.length > 0) {
        setCartItems(guestCart)
      }

      const guestWishlist = loadGuestWishlist()
      if (guestWishlist.length > 0) {
        setWishlistItems(guestWishlist)
      }
    }
  }, [isAuth, isLoading, userId, setCartItems, setWishlistItems, clearCart, clearWishlist])

  useEffect(() => {
    if (isAuth) return
    saveGuestCart(cartItems)
  }, [cartItems, isAuth])

  useEffect(() => {
    if (isAuth) return
    saveGuestWishlist(wishlistItems)
  }, [wishlistItems, isAuth])

  return null
}

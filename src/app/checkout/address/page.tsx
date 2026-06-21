"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { useCheckoutStore, type ShippingAddress } from "@/store/checkout"
import { AddressForm } from "@/components/checkout/address-form"
import type { ShippingAddressInput } from "@/lib/validations/address"
import { Container } from "@/components/layout/container"

const STORAGE_KEY = "checkout_address"

export default function CheckoutAddressPage() {
  const router = useRouter()
  const cartItems = useCart((s) => s.items)
  const setAddress = useCheckoutStore((s) => s.setAddress)
  const [saved] = useState<ShippingAddressInput | undefined>(() => {
    if (typeof window === "undefined") return undefined
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : undefined
    } catch {
      return undefined
    }
  })

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/products")
    }
  }, [cartItems, router])

  if (cartItems.length === 0) return null

  function handleSubmit(data: ShippingAddressInput) {
    setAddress(data as unknown as ShippingAddress)
    router.push("/checkout/review")
  }

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-16">
        <div className="mb-12">
          <span className="meta">Checkout</span>
          <h1 className="heading-section mt-2 text-text-primary">Shipping Address</h1>
        </div>

        <div className="bg-bg-surface p-8 sm:p-10 border border-border-subtle">
          <AddressForm defaultValues={saved} onSubmit={handleSubmit} />
        </div>
      </div>
    </Container>
  )
}

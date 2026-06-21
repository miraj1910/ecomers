"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"
import { useCheckoutStore } from "@/store/checkout"
import { calculateSubtotal } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

const SHIPPING_COST = 9.99
const FREE_SHIPPING_THRESHOLD = 100
const TAX_RATE = 0.08

export default function CheckoutReviewPage() {
  const router = useRouter()
  const cartItems = useCart((s) => s.items)
  const clearCart = useCart((s) => s.clearCart)
  const address = useCheckoutStore((s) => s.address)
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!address || cartItems.length === 0) {
      router.replace(address ? "/products" : "/checkout/address")
    }
  }, [address, cartItems, router])

  if (!address) return null

  const subtotal = calculateSubtotal(cartItems)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const tax = (subtotal - couponDiscount) * TAX_RATE
  const total = subtotal - couponDiscount + shipping + tax

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      })
      const data = await res.json()

      if (data.valid) {
        setCouponDiscount(data.discount)
        setAppliedCode(data.couponCode)
        setCouponCode("")
      } else {
        setCouponError(data.error ?? "Invalid coupon")
        setCouponDiscount(0)
        setAppliedCode(null)
      }
    } catch {
      setCouponError("Failed to validate coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponDiscount(0)
    setAppliedCode(null)
    setCouponCode("")
    setCouponError(null)
  }

  async function handlePay() {
    setLoading(true)
    setError(null)

    try {
      const addr = address!
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          shipping: {
            firstName: addr.firstName,
            lastName: addr.lastName,
            email: addr.email,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 ?? "",
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postalCode: addr.postalCode,
          },
          couponCode: appliedCode,
          discountAmount: couponDiscount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong")
      }

      clearCart()
      clearCheckout()
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="mx-auto max-w-4xl py-16">
        <div className="mb-12">
          <span className="meta">Checkout</span>
          <h1 className="heading-section mt-2 text-text-primary">Review Your Order</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-text-primary mb-6">Items</h2>
              <div className="divide-y divide-border-subtle">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-bg-secondary">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      {item.size && <p className="text-xs text-text-secondary mt-0.5">Size: {item.size}</p>}
                      <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="self-center text-sm font-medium text-text-primary">${(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-normal text-text-primary">Shipping Address</h2>
                <Link
                  href="/checkout/address"
                  className="text-xs text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
                >
                  Edit
                </Link>
              </div>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="text-text-primary font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="pt-2">{address.email}</p>
                <p>{address.phone}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-bg-surface p-8 border border-border-subtle lg:sticky lg:top-28">
              <h2 className="font-serif text-xl font-normal text-text-primary mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary">${subtotal.toFixed(0)}</span>
                </div>

                {!appliedCode ? (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <label className="text-xs text-text-secondary">Have a coupon?</label>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 h-10 border-b border-border-subtle bg-transparent px-0 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-text-primary transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="text-xs font-medium text-text-primary underline-offset-2 hover:underline disabled:opacity-40"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-error">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                    <span className="text-xs text-success font-medium">{appliedCode}</span>
                    <button onClick={handleRemoveCoupon} className="text-xs text-text-secondary hover:text-text-primary">
                      Remove
                    </button>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-${couponDiscount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-text-primary">
                    {shipping === 0 ? <span className="text-success">Free</span> : `$${shipping.toFixed(0)}`}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="text-text-primary">${tax.toFixed(0)}</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between text-base font-serif text-text-primary">
                    <span>Total</span>
                    <span>${total.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="mt-8 w-full"
                size="lg"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(0)}`
                )}
              </Button>

              <p className="mt-3 text-center text-xs text-text-secondary">
                Secure payment via Stripe
              </p>

              {error && (
                <p className="mt-3 text-center text-xs text-error">{error}</p>
              )}

              <Link
                href="/checkout/address"
                className="mt-6 flex items-center justify-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

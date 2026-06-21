import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { validateBody } from "@/lib/api-validation"
import { checkoutSessionSchema } from "@/lib/validations/checkout"
import { trackCartForRecovery } from "@/lib/cart-recovery"
import { trackEvent } from "@/lib/analytics"

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const ip = getRateLimitKey(request)
  const rateLimitResponse = rateLimitMiddleware(`checkout:${ip}`, { maxRequests: 10, interval: 60_000 })
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  const userId = session?.user?.id ?? `guest_${crypto.randomUUID()}`
  let shipping: Record<string, unknown> = {}
  let checkoutItems: { productId: string; name: string; price: number; quantity: number; size?: string; image?: string }[] = []
  let couponCode: string | undefined
  let discountAmount: number | undefined

  try {
    const body = await request.json()
    const parsed = validateBody(body, checkoutSessionSchema)
    if (parsed.error) return parsed.error
    const { items, shipping: parsedShipping, couponCode: cc, discountAmount: da } = parsed.data
    checkoutItems = items
    shipping = parsedShipping
    couponCode = cc
    discountAmount = da

    const insufficientItems: {
      productId: string
      name: string
      requested: number
      available: number
    }[] = []

    for (const item of checkoutItems) {
      const inventory = await prisma.productInventory.findUnique({
        where: { productId: item.productId },
      })

      let available: number
      if (inventory) {
        available = inventory.stock - inventory.reservedStock
      } else {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        })
        available = product?.stock ?? 0
      }

      if (available < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          name: item.name,
          requested: item.quantity,
          available: Math.max(0, available),
        })
      }
    }

    if (insufficientItems.length > 0) {
      return NextResponse.json(
        { error: "Insufficient stock for some items", insufficientItems },
        { status: 409 }
      )
    }

    const productStocks = new Map<string, { stock: number; sku: string }>()
    for (const item of checkoutItems) {
      const existingInventory = await prisma.productInventory.findUnique({
        where: { productId: item.productId },
      })

      if (existingInventory) {
        await prisma.productInventory.update({
          where: { productId: item.productId },
          data: { reservedStock: { increment: item.quantity } },
        })
      } else {
        if (!productStocks.has(item.productId)) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, sku: true },
          })
          productStocks.set(item.productId, {
            stock: product?.stock ?? 0,
            sku: product?.sku ?? item.productId,
          })
        }
        const ps = productStocks.get(item.productId)!
        await prisma.productInventory.create({
          data: {
            productId: item.productId,
            sku: ps.sku,
            stock: ps.stock,
            reservedStock: item.quantity,
            lowStockThreshold: 5,
          },
        }).catch(() => {
          // Race condition: another request created the record first
          // Just increment reservedStock on the existing record
          return prisma.productInventory.update({
            where: { productId: item.productId },
            data: { reservedStock: { increment: item.quantity } },
          })
        })
      }
    }

    const stripe = getStripe()

    const metadata: Record<string, string> = {
      userId,
      cart: JSON.stringify(
        checkoutItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size ?? "",
        }))
      ),
      shipping: JSON.stringify(shipping),
      ...(couponCode ? { couponCode: couponCode, discountAmount: String(discountAmount ?? 0) } : {}),
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: userId,
      metadata,
      line_items: checkoutItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: { productId: item.productId },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  } finally {
    // Track for recovery outside try/catch — won't throw
    if (shipping?.email) {
      trackCartForRecovery(shipping.email as string, userId, {
        items: checkoutItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          size: i.size,
        })),
      }).catch(() => {})
    }
  }
}

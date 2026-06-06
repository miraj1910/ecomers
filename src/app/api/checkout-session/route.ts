import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import { validateBody } from "@/lib/api-validation"
import { checkoutSessionSchema } from "@/lib/validations/checkout"

export async function POST(request: Request) {
  const ip = getRateLimitKey(request)
  const rateLimitResponse = rateLimitMiddleware(`checkout:${ip}`, { maxRequests: 10, interval: 60_000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await auth()
    const userId = session?.user?.id ?? `guest_${crypto.randomUUID()}`

    const body = await request.json()
    const parsed = validateBody(body, checkoutSessionSchema)
    if (parsed.error) return parsed.error
    const { items } = parsed.data

    const insufficientItems: {
      productId: string
      name: string
      requested: number
      available: number
    }[] = []

    for (const item of items) {
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

    const stripe = getStripe()

    const metadata: Record<string, string> = {
      userId,
      cart: JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size ?? "",
        }))
      ),
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: userId,
      metadata,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
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
  }
}

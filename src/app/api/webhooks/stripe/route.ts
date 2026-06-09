import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import type Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const ip = getRateLimitKey(req)
  const rateLimitResponse = rateLimitMiddleware(`webhook:${ip}`, { maxRequests: 20, interval: 60_000 })
  if (rateLimitResponse) return rateLimitResponse

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new NextResponse("No signature", { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set")
    return new NextResponse("Webhook secret not configured", { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true })
  }

  const stripeSession = event.data.object as Stripe.Checkout.Session

  try {
    const userId =
      stripeSession.client_reference_id ?? stripeSession.metadata?.userId
    if (!userId) {
      console.error(
        "[Stripe Webhook] Missing user ID for session:",
        stripeSession.id
      )
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    let cartItems: {
      productId: string
      name: string
      price: number
      quantity: number
      size?: string
      image?: string
    }[]

    try {
      cartItems = JSON.parse(stripeSession.metadata?.cart ?? "[]")
    } catch {
      cartItems = []
    }

    if (cartItems.length === 0) {
      const lineItems = await getStripe().checkout.sessions.listLineItems(
        stripeSession.id
      )
      const productNames = lineItems.data.map((item) => item.description ?? "")
      const dbProducts = await prisma.product.findMany({
        where: { name: { in: productNames } },
        select: { id: true, name: true, slug: true, price: true, images: true },
      })
      const productByName = new Map(dbProducts.map((p) => [p.name, p]))
      cartItems = lineItems.data.map((item) => {
        const product = productByName.get(item.description ?? "")
        return {
          productId: product?.id ?? "unknown",
          name: item.description ?? "Unknown",
          price: product
            ? Number(product.price)
            : (item.amount_total ?? 0) / 100 / (item.quantity ?? 1),
          quantity: item.quantity ?? 1,
          image: product?.images?.[0],
        }
      })
    }

    const totalAmount =
      stripeSession.amount_total != null
        ? stripeSession.amount_total / 100
        : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { stripeSessionId: stripeSession.id },
      })
      if (existingOrder) {
        throw new Error("DUPLICATE_SESSION")
      }

      const paymentIntentId =
        typeof stripeSession.payment_intent === "string"
          ? stripeSession.payment_intent
          : stripeSession.payment_intent?.id ?? null

      if (paymentIntentId) {
        const existingByIntent = await tx.order.findUnique({
          where: { paymentIntentId },
        })
        if (existingByIntent) {
          throw new Error("DUPLICATE_INTENT")
        }
      }

      const userExists = await tx.user.findUnique({ where: { id: userId } })
      if (!userExists) {
        await tx.user.create({
          data: {
            id: userId,
            name: `Guest ${stripeSession.id.slice(0, 8)}`,
            email: null,
            role: "CUSTOMER",
          },
        })
      }

      const order = await tx.order.create({
        data: {
          userId,
          stripeSessionId: stripeSession.id,
          paymentIntentId,
          totalAmount,
          paymentStatus: "PAID",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size ?? null,
              image: item.image ?? null,
            })),
          },
        },
        include: { items: true },
      })

      for (const item of cartItems) {
        const inventory = await tx.productInventory.findUnique({
          where: { productId: item.productId },
        })

        if (!inventory) {
          console.warn(
            `[Stripe Webhook] No inventory record for ${item.productId}, creating one`
          )
          await tx.productInventory.create({
            data: {
              productId: item.productId,
              sku: item.productId,
              stock: 0,
            },
          })
          continue
        }

        const newStock = inventory.stock - item.quantity
        if (newStock < 0) {
          console.warn(
            `[Stripe Webhook] Insufficient stock for ${item.productId}: ` +
              `requested ${item.quantity}, available ${inventory.stock}. ` +
              `Order ${order.id} will proceed with partial stock.`
          )
        }

        await tx.productInventory.update({
          where: { productId: item.productId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: {
              decrement: Math.min(item.quantity, inventory.reservedStock),
            },
          },
        })
      }
    }).catch((error) => {
      if (error instanceof Error && error.message.startsWith("DUPLICATE")) {
        return
      }
      throw error
    })

    revalidatePath("/orders")
    revalidatePath("/products")

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error processing session:", stripeSession.id, error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import { CACHE_TAGS } from "@/lib/cache"
import { sendOrderConfirmationEmail } from "@/lib/email/triggers"
import { markRecoveredByEmail } from "@/lib/cart-recovery"
import { trackEvent } from "@/lib/analytics"
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
        if (!product) {
          console.warn(
            `[Stripe Webhook] No matching product for line item: "${item.description}". Skipping.`
          )
        }
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
      cartItems = cartItems.filter((item) => item.productId !== "unknown")
    }

      const totalAmount =
        stripeSession.amount_total != null
          ? stripeSession.amount_total / 100
          : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      let shippingData: {
        shippingName: string
        shippingEmail?: string
        shippingPhone?: string
        shippingStreet: string
        shippingCity: string
        shippingState: string
        shippingPostal: string
        shippingCountry: string
      } | null = null

      try {
        const raw = stripeSession.metadata?.shipping
        if (raw) {
          const parsed = JSON.parse(raw)
          shippingData = {
            shippingName: `${parsed.firstName} ${parsed.lastName}`,
            shippingEmail: parsed.email,
            shippingPhone: parsed.phone,
            shippingStreet: parsed.addressLine1,
            shippingCity: parsed.city,
            shippingState: parsed.state,
            shippingPostal: parsed.postalCode,
            shippingCountry: parsed.country,
          }
        }
      } catch {
        // invalid shipping metadata - proceed without
      }

      let couponCode: string | null = null
      let discountAmount: number | null = null
      let couponId: string | null = null

      try {
        couponCode = stripeSession.metadata?.couponCode ?? null
        discountAmount = stripeSession.metadata?.discountAmount
          ? Number(stripeSession.metadata.discountAmount)
          : null
      } catch {
        // ignore
      }

      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
        if (coupon) {
          couponId = coupon.id
        }
      }

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
          discountAmount: discountAmount ?? null,
          couponId,
          paymentStatus: "PAID",
          shippingName: shippingData?.shippingName ?? "Guest",
      shippingEmail: shippingData?.shippingEmail,
      shippingPhone: shippingData?.shippingPhone,
      shippingStreet: shippingData?.shippingStreet ?? "",
      shippingCity: shippingData?.shippingCity ?? "",
      shippingState: shippingData?.shippingState ?? "",
      shippingPostal: shippingData?.shippingPostal ?? "",
      shippingCountry: shippingData?.shippingCountry ?? "US",
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
    revalidateTag(CACHE_TAGS.orders, 'max')
    revalidateTag(CACHE_TAGS.products, 'max')
    revalidateTag(CACHE_TAGS.inventory, 'max')

    // Increment coupon usage count outside transaction
    if (couponCode) {
      prisma.coupon
        .update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        })
        .catch((err) => {
          console.error("[Stripe Webhook] Failed to increment coupon usage:", err)
        })
    }

    // Send confirmation email outside transaction
    const createdOrder = await prisma.order.findUnique({
      where: { stripeSessionId: stripeSession.id },
      include: { items: true },
    })

    if (createdOrder) {
      sendOrderConfirmationEmail({
        id: createdOrder.id,
        totalAmount: Number(createdOrder.totalAmount),
        shippingName: createdOrder.shippingName,
        shippingEmail: createdOrder.shippingEmail,
        shippingStreet: createdOrder.shippingStreet,
        shippingCity: createdOrder.shippingCity,
        shippingState: createdOrder.shippingState,
        shippingPostal: createdOrder.shippingPostal,
        shippingCountry: createdOrder.shippingCountry,
        items: createdOrder.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          size: item.size,
          image: item.image,
        })),
      }).catch((err) => {
        console.error("[Stripe Webhook] Failed to send confirmation email:", err)
      })
    }

    // Track analytics & cart recovery
    const shippingEmail = shippingData?.shippingEmail
    if (shippingEmail) {
      markRecoveredByEmail(shippingEmail).catch(() => {})
    }

    trackEvent("order_completed", {
      orderId: stripeSession.id,
      totalAmount,
      hasCoupon: !!couponCode,
      couponCode,
    })

    if (couponCode) {
      trackEvent("coupon_used", { couponCode, discountAmount, orderId: stripeSession.id })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error processing session:", stripeSession.id, error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

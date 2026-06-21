import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { validateBody } from "@/lib/api-validation"
import { z } from "zod"

const mergeItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(255),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  image: z.string().default(""),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
})

const mergeCartSchema = z.object({
  items: z.array(mergeItemSchema),
})

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`cart-merge:${session.user.id}`, {
    maxRequests: 5,
    interval: 60_000,
  })
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(body, mergeCartSchema)
  if (parsed.error) return parsed.error

  const { items: guestItems } = parsed.data

  if (guestItems.length === 0) {
    const existingCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })
    return NextResponse.json({
      items: (existingCart?.items ?? []).map((i) => ({
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image,
        size: i.size ?? undefined,
        color: i.color ?? undefined,
      })),
    })
  }

  const result = await prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })

    if (!cart) {
      cart = await tx.cart.create({
        data: { userId: session.user.id },
        include: { items: true },
      })
    }

    for (const guestItem of guestItems) {
      const existing = cart.items.find(
        (i) => i.productId === guestItem.productId
      )

      if (existing) {
        const mergedQty = Math.max(existing.quantity, guestItem.quantity)
        await tx.cartItem.update({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: guestItem.productId,
            },
          },
          data: { quantity: mergedQty },
        })
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: guestItem.productId,
            name: guestItem.name,
            price: guestItem.price,
            quantity: guestItem.quantity,
            image: guestItem.image ?? "",
            size: guestItem.size,
            color: guestItem.color,
          },
        })
      }
    }

    const updatedCart = await tx.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })

    return (updatedCart?.items ?? []).map((i) => ({
      productId: i.productId,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      image: i.image,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
    }))
  })

  return NextResponse.json({ items: result })
}

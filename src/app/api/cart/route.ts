import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody } from "@/lib/api-validation"
import { z } from "zod"

const rateLimitConfig = { maxRequests: 60, interval: 60_000 }

const addItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(255),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  image: z.string().default(""),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
})

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    })
  }
  return cart
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`cart:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  })

  return NextResponse.json({
    items: (cart?.items ?? []).map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
    })),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`cart:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(body, addItemSchema)
  if (parsed.error) return parsed.error

  const cart = await getOrCreateCart(session.user.id)
  const { productId, name, price, quantity, image, size, color } = parsed.data

  const existing = cart.items.find((i) => i.productId === productId)
  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, name, price, quantity, image, size, color },
    })
  }

  const updatedCart = await getOrCreateCart(session.user.id)

  return NextResponse.json({
    items: updatedCart.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
    })),
  })
}

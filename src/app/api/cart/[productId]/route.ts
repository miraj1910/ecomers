import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody } from "@/lib/api-validation"
import { z } from "zod"

const rateLimitConfig = { maxRequests: 60, interval: 60_000 }

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1),
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`cart:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const { productId } = await params

  const body = await request.json()
  const parsed = validateBody(body, updateQuantitySchema)
  if (parsed.error) return parsed.error

  const cart = await getOrCreateCart(session.user.id)
  const existing = cart.items.find((i) => i.productId === productId)

  if (!existing) {
    return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity: parsed.data.quantity },
  })

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`cart:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const { productId } = await params

  const cart = await getOrCreateCart(session.user.id)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  })

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

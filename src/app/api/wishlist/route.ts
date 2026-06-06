import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody } from "@/lib/api-validation"
import { z } from "zod"

const rateLimitConfig = { maxRequests: 60, interval: 60_000 }

const addItemSchema = z.object({
  productId: z.string().min(1),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`wishlist:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    items: items.map((i) => ({
      productId: i.productId,
      createdAt: i.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`wishlist:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(body, addItemSchema)
  if (parsed.error) return parsed.error

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    },
  })

  if (!existing) {
    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    })
  }

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { z } from "zod"

const rateLimitConfig = { maxRequests: 30, interval: 60_000 }

const mergeSchema = z.object({
  productIds: z.array(z.string().min(1)),
})

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`wishlist:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const body = await request.json()
  const parsed = mergeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { productIds } = parsed.data

  const existingItems = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  })
  const existingSet = new Set(existingItems.map((i) => i.productId))

  const newItems = productIds.filter((id) => !existingSet.has(id))

  if (newItems.length > 0) {
    await prisma.wishlist.createMany({
      data: newItems.map((productId) => ({
        userId: session.user.id,
        productId,
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ success: true, merged: newItems.length })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"

const rateLimitConfig = { maxRequests: 60, interval: 60_000 }

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = rateLimitMiddleware(`wishlist:${session.user.id}`, rateLimitConfig)
  if (rl) return rl

  const { productId } = await params

  await prisma.wishlist.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  })

  return NextResponse.json({ success: true })
}

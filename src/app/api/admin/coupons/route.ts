import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { couponSchema } from "@/lib/validations/coupon"

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const ip = getRateLimitKey(request)
  const rateLimitResponse = rateLimitMiddleware(`admin:coupons:${ip}`, { maxRequests: 30, interval: 60_000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const parsed = couponSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } })
    if (existing) {
      return NextResponse.json({ error: `Coupon code "${parsed.data.code}" already exists` }, { status: 409 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        type: parsed.data.type,
        value: parsed.data.value,
        active: parsed.data.active,
        usageLimit: parsed.data.usageLimit,
        usedCount: parsed.data.usedCount,
        minAmount: parsed.data.minAmount ?? null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error("[Admin Coupons] Create error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (updates.active !== undefined) data.active = updates.active
    if (updates.code !== undefined) data.code = updates.code
    if (updates.type !== undefined) data.type = updates.type
    if (updates.value !== undefined) data.value = updates.value
    if (updates.usageLimit !== undefined) data.usageLimit = updates.usageLimit
    if (updates.minAmount !== undefined) data.minAmount = updates.minAmount ?? null
    if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null

    await prisma.coupon.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Coupons] Update error:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  try {
    const body = await request.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Coupons] Delete error:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}

"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/middleware-helpers"
import type { CouponInput } from "@/lib/validations/coupon"
import { CACHE_TAGS } from "@/lib/cache"

export async function getAdminCoupons(page: number = 1, pageSize: number = 20, search?: string) {
  await requireAdmin()

  const where: Record<string, unknown> = {}
  if (search) {
    where.code = { contains: search, mode: "insensitive" }
  }

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coupon.count({ where }),
  ])

  return {
    coupons: coupons.map((c) => ({
      ...c,
      value: Number(c.value),
      minAmount: c.minAmount ? Number(c.minAmount) : null,
      expiresAt: c.expiresAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function createCoupon(input: CouponInput) {
  await requireAdmin()

  const existing = await prisma.coupon.findUnique({ where: { code: input.code } })
  if (existing) {
    throw new Error(`Coupon code "${input.code}" already exists`)
  }

  await prisma.coupon.create({
    data: {
      code: input.code,
      type: input.type,
      value: input.value,
      active: input.active,
      usageLimit: input.usageLimit,
      usedCount: input.usedCount,
      minAmount: input.minAmount ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })

  revalidatePath("/admin/coupons")
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  await requireAdmin()

  const data: Record<string, unknown> = {}

  if (input.code !== undefined) data.code = input.code
  if (input.type !== undefined) data.type = input.type
  if (input.value !== undefined) data.value = input.value
  if (input.active !== undefined) data.active = input.active
  if (input.usageLimit !== undefined) data.usageLimit = input.usageLimit
  if (input.minAmount !== undefined) data.minAmount = input.minAmount ?? null
  if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null

  await prisma.coupon.update({ where: { id }, data })
  revalidatePath("/admin/coupons")
}

export async function deleteCoupon(id: string) {
  await requireAdmin()
  await prisma.coupon.delete({ where: { id } })
  revalidatePath("/admin/coupons")
}

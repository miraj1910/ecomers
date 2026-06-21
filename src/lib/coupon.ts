import { prisma } from "@/lib/prisma"

interface CouponValidationResult {
  valid: boolean
  discount: number
  couponCode?: string
  error?: string
}

export async function validateAndCalculateDiscount(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, discount: 0, error: "Coupon code is required" }
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!coupon) {
    return { valid: false, discount: 0, error: "Invalid coupon code" }
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, error: "This coupon is no longer active" }
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, discount: 0, error: "This coupon has expired" }
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: "This coupon has reached its usage limit" }
  }

  if (coupon.minAmount && subtotal < Number(coupon.minAmount)) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order amount of $${Number(coupon.minAmount).toFixed(2)} required`,
    }
  }

  let discount = 0
  if (coupon.type === "PERCENTAGE") {
    discount = subtotal * (Number(coupon.value) / 100)
  } else {
    discount = Number(coupon.value)
  }

  discount = Math.min(discount, subtotal)

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    couponCode: coupon.code,
  }
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await prisma.coupon.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  })
}

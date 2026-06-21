import { NextResponse } from "next/server"
import { validateAndCalculateDiscount } from "@/lib/coupon"
import { trackEvent } from "@/lib/analytics"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Code and subtotal are required" }, { status: 400 })
    }

    const result = await validateAndCalculateDiscount(code, subtotal)

    if (result.valid) {
      trackEvent("coupon_applied", { code: result.couponCode, discount: result.discount, subtotal })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Coupon Validate] Error:", error)
    return NextResponse.json({ valid: false, discount: 0, error: "Failed to validate coupon" })
  }
}

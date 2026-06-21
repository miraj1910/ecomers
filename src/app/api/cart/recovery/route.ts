import { NextResponse } from "next/server"
import { processPendingRecoveries } from "@/lib/cart-recovery"
import { trackEvent } from "@/lib/analytics"

export const runtime = "nodejs"

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron, pg_cron, external scheduler)
export async function POST(request: Request) {
  try {
    // Simple bearer token auth for cron security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret) {
      if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const sent = await processPendingRecoveries()

    trackEvent("cart_recovery_cron", { emailsSent: sent })

    return NextResponse.json({ success: true, emailsSent: sent })
  } catch (error) {
    console.error("[Cart Recovery Cron] Error:", error)
    return NextResponse.json({ error: "Failed to process recoveries" }, { status: 500 })
  }
}

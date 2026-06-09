import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"

const ADMIN_PASSWORD = "123"
const COOKIE_NAME = "admin_token"

export async function POST(request: Request) {
  const ip = getRateLimitKey(request)
  const rl = rateLimitMiddleware(`admin-verify:${ip}`, { maxRequests: 10, interval: 60_000 })
  if (rl) return rl

  try {
    const body = await request.json()
    const { password } = body

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/verify] Error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

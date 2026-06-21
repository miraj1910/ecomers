import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { rateLimitMiddleware, getRateLimitKey } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"

const COOKIE_NAME = "admin_token"

export async function POST(request: Request) {
  const ip = getRateLimitKey(request)
  const rl = rateLimitMiddleware(`admin-verify:${ip}`, { maxRequests: 10, interval: 60_000 })
  if (rl) return rl

  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  if (!passwordHash) {
    console.error("[admin/verify] ADMIN_PASSWORD_HASH environment variable is not set")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/admin",
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/verify] Error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

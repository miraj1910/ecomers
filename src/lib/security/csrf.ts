import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

export function validateCsrf(request: Request): NextResponse | null {
  if (request.method === "GET" || request.method === "HEAD") return null

  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.some(
      (allowed) => origin === allowed || origin.startsWith(allowed + "/")
    )
    if (!isAllowed) {
      console.warn("[CSRF] Blocked request from origin:", origin)
      return NextResponse.json(
        { error: "CSRF validation failed: invalid origin" },
        { status: 403 }
      )
    }
    return null
  }

  if (referer) {
    const isAllowed = ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))
    if (!isAllowed) {
      console.warn("[CSRF] Blocked request from referer:", referer)
      return NextResponse.json(
        { error: "CSRF validation failed: invalid referer" },
        { status: 403 }
      )
    }
    return null
  }

  return null
}

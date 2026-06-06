import { randomBytes } from "crypto"
import { cookies } from "next/headers"

const CSRF_COOKIE = "__Host-csrf-token"
const CSRF_HEADER = "x-csrf-token"
const TOKEN_LENGTH = 32

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString("hex")
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  })
  return token
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  if (!cookieToken) return false

  const headerToken = request.headers.get(CSRF_HEADER)
  if (!headerToken) return false

  return timingSafeEqual(cookieToken, headerToken)
}

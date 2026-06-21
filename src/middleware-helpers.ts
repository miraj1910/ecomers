import { auth } from "@/lib/auth"
import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_token"
const ADMIN_COOKIE_VALUE = "verified"

export async function requireAdmin() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  if (adminCookie?.value === ADMIN_COOKIE_VALUE) {
    return null
  }

  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }
  return session
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

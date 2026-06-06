import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody, validateSearchParams } from "@/lib/api-validation"
import { adminQuerySchema } from "@/lib/validations/admin"
import { getAdminUsers, updateUserRole, updateUserStatus, softDeleteUser } from "@/lib/actions/admin"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const url = new URL(request.url)
  const parsed = validateSearchParams(url, adminQuerySchema)
  if (parsed.error) return parsed.error

  const data = await getAdminUsers({
    page: parsed.data.page,
    pageSize: 20,
    search: parsed.data.search,
  })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const body = await request.json()
  const { userId, action, value } = body

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  try {
    if (action === "role") {
      if (!["CUSTOMER", "ADMIN"].includes(value)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      await updateUserRole(userId, value)
      return NextResponse.json({ success: true })
    }

    if (action === "status") {
      if (!["ACTIVE", "BLOCKED"].includes(value)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      await updateUserStatus(userId, value)
      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      await softDeleteUser(userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Operation failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

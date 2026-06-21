import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { bulkUpdateOrdersStatus } from "@/actions/admin"

const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:orders:bulk:${session.user.id}`, { maxRequests: 20, interval: 60_000 })
  if (rl) return rl

  try {
    const body = await request.json()
    const { ids, orderStatus } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required and must not be empty" }, { status: 400 })
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Maximum 100 items per bulk operation" }, { status: 400 })
    }

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
    }

    await bulkUpdateOrdersStatus(ids, orderStatus)
    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk operation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

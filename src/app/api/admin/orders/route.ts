import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { validateSearchParams } from "@/lib/api-validation"
import { orderStatusFilterSchema } from "@/lib/validations/admin"
import { getAdminOrders, updateOrderStatus } from "@/lib/actions/admin"

const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const url = new URL(request.url)
  const parsed = validateSearchParams(url, orderStatusFilterSchema)
  if (parsed.error) return parsed.error

  const data = await getAdminOrders({
    page: parsed.data.page,
    pageSize: 20,
    search: parsed.data.search,
    status: parsed.data.status,
  })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const body = await request.json()
  const { orderId, orderStatus } = body

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 })
  }

  if (!validStatuses.includes(orderStatus)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
  }

  try {
    await updateOrderStatus(orderId, orderStatus)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

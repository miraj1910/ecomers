import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { bulkDeleteProducts, bulkUpdateProducts, bulkPublishProducts } from "@/lib/actions/admin"

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:products:bulk:${session.user.id}`, { maxRequests: 20, interval: 60_000 })
  if (rl) return rl

  try {
    const body = await request.json()
    const { action, ids, data } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required and must not be empty" }, { status: 400 })
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Maximum 100 items per bulk operation" }, { status: 400 })
    }

    switch (action) {
      case "delete":
        await bulkDeleteProducts(ids)
        return NextResponse.json({ success: true, count: ids.length })

      case "update":
        if (!data || typeof data !== "object") {
          return NextResponse.json({ error: "data object is required for update action" }, { status: 400 })
        }
        await bulkUpdateProducts(ids, data)
        return NextResponse.json({ success: true, count: ids.length })

      case "publish":
        await bulkPublishProducts(ids, "ACTIVE")
        return NextResponse.json({ success: true, count: ids.length })

      case "unpublish":
        await bulkPublishProducts(ids, "INACTIVE")
        return NextResponse.json({ success: true, count: ids.length })

      default:
        return NextResponse.json({ error: `Invalid action: ${action}. Must be one of: delete, update, publish, unpublish` }, { status: 400 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk operation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

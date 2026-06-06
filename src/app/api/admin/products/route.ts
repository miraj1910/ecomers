import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody, validateSearchParams } from "@/lib/api-validation"
import { createProductSchema, productQuerySchema } from "@/lib/validations/product"
import { getAdminProducts, createProduct } from "@/lib/actions/admin"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const url = new URL(request.url)
  const parsed = validateSearchParams(url, productQuerySchema)
  if (parsed.error) return parsed.error

  const data = await getAdminProducts(parsed.data)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(body, createProductSchema)
  if (parsed.error) return parsed.error

  try {
    const result = await createProduct(parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

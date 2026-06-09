import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateBody } from "@/lib/api-validation"
import { updateProductSchema } from "@/lib/validations/product"
import { getAdminProduct, updateProduct, deleteProduct } from "@/lib/actions/admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const { id } = await params

  try {
    const product = await getAdminProduct(id)
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const { id } = await params
  const body = await request.json()
  const parsed = validateBody({ ...body, id }, updateProductSchema)
  if (parsed.error) return parsed.error

  try {
    await updateProduct(parsed.data)
    return NextResponse.json({ success: true, productId: id })
  } catch (error) {
    console.error(`[PUT /api/admin/products/${id}] Error:`, error)
    const message = error instanceof Error ? error.message : "Failed to update product"
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const { id } = await params

  try {
    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}

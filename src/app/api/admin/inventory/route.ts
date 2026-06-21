import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { validateBody, validateSearchParams } from "@/lib/api-validation"
import { updateInventorySchema, addInventoryItemSchema, adminQuerySchema } from "@/lib/validations/admin"

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

  const page = parsed.data.page ?? 1
  const pageSize = 20
  const search = parsed.data.search

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { productId: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.productInventory.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.productInventory.count({ where }),
  ])

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      sku: i.sku,
      stock: i.stock,
      reservedStock: i.reservedStock,
      lowStockThreshold: i.lowStockThreshold,
      availableStock: i.stock - i.reservedStock,
      updatedAt: i.updatedAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
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
  const parsed = validateBody(body, updateInventorySchema)
  if (parsed.error) return parsed.error

  const { productId, stock, sku, lowStockThreshold } = parsed.data

  const data: Record<string, unknown> = {}
  if (stock !== undefined) data.stock = stock
  if (sku !== undefined) data.sku = sku
  if (lowStockThreshold !== undefined) data.lowStockThreshold = lowStockThreshold

  await prisma.productInventory.upsert({
    where: { productId },
    create: {
      productId,
      sku: sku ?? productId,
      stock: stock ?? 0,
      lowStockThreshold: lowStockThreshold ?? 5,
    },
    update: data,
  })

  return NextResponse.json({ success: true })
}

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(body, addInventoryItemSchema)
  if (parsed.error) return parsed.error

  const { productId, stock, sku, lowStockThreshold } = parsed.data

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
  })
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const existingInventory = await prisma.productInventory.findUnique({
    where: { productId },
  })
  if (existingInventory) {
    return NextResponse.json({ error: "Inventory item already exists for this product" }, { status: 409 })
  }

  const existingSku = await prisma.productInventory.findUnique({
    where: { sku },
  })
  if (existingSku) {
    return NextResponse.json({ error: "A inventory item with this SKU already exists" }, { status: 409 })
  }

  const item = await prisma.productInventory.create({
    data: { productId, stock, sku, lowStockThreshold },
  })

  return NextResponse.json({
    success: true,
    item: {
      id: item.id,
      productId: item.productId,
      sku: item.sku,
      stock: item.stock,
      reservedStock: item.reservedStock,
      lowStockThreshold: item.lowStockThreshold,
      availableStock: item.stock - item.reservedStock,
      updatedAt: item.updatedAt,
    },
  }, { status: 201 })
}

export async function DELETE(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  const url = new URL(request.url)
  const productId = url.searchParams.get("productId")

  if (!productId) {
    return NextResponse.json({ error: "productId query parameter is required" }, { status: 400 })
  }

  const existing = await prisma.productInventory.findUnique({
    where: { productId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
  }

  await prisma.productInventory.delete({
    where: { productId },
  })

  return NextResponse.json({ success: true })
}

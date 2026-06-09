import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:${session.user.id}`, { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const lowStockItems = await prisma.productInventory.findMany({
    where: {
      stock: { gt: 0 },
      AND: [
        { stock: { lte: 0 } }, // placeholder, replaced by filter below
      ],
    },
    orderBy: { stock: "asc" },
    take: 50,
    select: {
      productId: true,
      stock: true,
      sku: true,
      reservedStock: true,
      lowStockThreshold: true,
    },
  })

  const allItems = await prisma.productInventory.findMany({
    orderBy: { stock: "asc" },
  })

  const lowStock = allItems.filter(
    (i) => i.stock > 0 && i.stock <= i.lowStockThreshold
  ).slice(0, 50)

  const outOfStock = allItems.filter((i) => i.stock - i.reservedStock <= 0)

  const productIds = [...new Set([...lowStock, ...outOfStock].map((i) => i.productId))]
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      })
    : []
  const productNameMap = new Map(products.map((p) => [p.id, p.name]))

  const items = lowStock.map((i) => ({
    productId: i.productId,
    productName: productNameMap.get(i.productId) ?? null,
    stock: i.stock,
    sku: i.sku,
    reservedStock: i.reservedStock,
    threshold: i.lowStockThreshold,
  }))

  return NextResponse.json({
    items,
    outOfStockCount: outOfStock.length,
    total: lowStock.length,
  })
}

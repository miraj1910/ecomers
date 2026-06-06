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

  const allItems = await prisma.productInventory.findMany({
    orderBy: { stock: "asc" },
  })

  const lowStock = allItems.filter(
    (i) => i.stock > 0 && i.stock <= i.lowStockThreshold
  )

  const outOfStock = allItems.filter((i) => i.stock - i.reservedStock <= 0)

  return NextResponse.json({
    items: lowStock.map((i) => ({
      productId: i.productId,
      stock: i.stock,
      sku: i.sku,
      reservedStock: i.reservedStock,
      threshold: i.lowStockThreshold,
    })),
    outOfStockCount: outOfStock.length,
    total: lowStock.length,
  })
}

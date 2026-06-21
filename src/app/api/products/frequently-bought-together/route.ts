import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { productIds } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json([])
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      select: { orderId: true },
    })

    const orderIds = [...new Set(orderItems.map((o) => o.orderId))]
    if (orderIds.length === 0) return NextResponse.json([])

    const coOccurrences = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { notIn: productIds },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 4,
    })

    if (coOccurrences.length === 0) return NextResponse.json([])

    const ids = coOccurrences.map((c) => c.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        images: true,
        stock: true,
      },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))
    const sorted = coOccurrences
      .map((c) => productMap.get(c.productId))
      .filter(Boolean)
      .slice(0, 4)

    const toNum = (v: unknown): number => {
      if (v === null || v === undefined) return 0
      if (typeof v === "number") return v
      if (typeof v === "object" && v !== null && "toNumber" in v) return (v as { toNumber: () => number }).toNumber()
      return Number(v)
    }

    return NextResponse.json(
      sorted.map((p) => ({
        id: p!.id,
        name: p!.name,
        slug: p!.slug,
        price: toNum(p!.price),
        comparePrice: p!.discountPrice ? toNum(p!.discountPrice) : null,
        image: (p!.images as string[])?.[0] ?? null,
        stock: p!.stock,
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}

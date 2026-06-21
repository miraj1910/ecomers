import "server-only"
import { prisma } from "@/lib/prisma"
import { cached, CACHE_TAGS } from "@/lib/cache"

type RecommendationProduct = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  image: string | null
  category: string | null
  stock: number
}

async function fetchTrendingProducts(limit = 8): Promise<RecommendationProduct[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      images: true,
      category: true,
      stock: true,
    },
  })

  const orderCounts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit * 3,
  })

  const countMap = new Map(orderCounts.map((o) => [o.productId, Number(o._sum.quantity ?? 0)]))

  const scored = products
    .map((p) => ({
      ...p,
      score: countMap.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map(mapProduct)
}

async function fetchRelatedProducts(
  productId: string,
  categorySlug?: string | null,
  limit = 8
): Promise<RecommendationProduct[]> {
  const where: Record<string, unknown> = {
    id: { not: productId },
    deletedAt: null,
    status: "ACTIVE",
  }

  if (categorySlug) {
    where.category = { not: null }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit * 2,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      images: true,
      category: true,
      stock: true,
    },
  })

  if (categorySlug) {
    const filtered = products.filter((p) => {
      if (!p.category) return false
      return p.category.toLowerCase().replace(/\s+/g, "-") === categorySlug
    })
    const remaining = products.filter((p) => !filtered.includes(p))
    return [...filtered, ...remaining].slice(0, limit).map(mapProduct)
  }

  return products.slice(0, limit).map(mapProduct)
}

async function fetchFrequentlyBoughtTogether(
  productIds: string[],
  limit = 4
): Promise<RecommendationProduct[]> {
  if (productIds.length === 0) return []

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    select: { orderId: true },
  })

  const orderIds = [...new Set(orderItems.map((o) => o.orderId))]
  if (orderIds.length === 0) return []

  const coOccurrences = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      orderId: { in: orderIds },
      productId: { notIn: productIds },
    },
    _count: { productId: true },
    _sum: { quantity: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  })

  if (coOccurrences.length === 0) return []

  const coProductIds = coOccurrences.map((c) => c.productId)
  const products = await prisma.product.findMany({
    where: {
      id: { in: coProductIds },
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      images: true,
      category: true,
      stock: true,
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))
  const sortedByScore = coOccurrences
    .map((c) => ({
      product: productMap.get(c.productId),
      count: c._count.productId,
    }))
    .filter((c) => c.product)
    .sort((a, b) => b.count - a.count)

  return sortedByScore.slice(0, limit).map((c) => mapProduct(c.product!))
}

function mapProduct(p: {
  id: string
  name: string
  slug: string
  price: { toNumber: () => number } | number
  discountPrice: { toNumber: () => number } | number | null
  images: string[]
  category: string | null
  stock: number
}): RecommendationProduct {
  const toNum = (v: unknown): number => {
    if (v === null || v === undefined) return 0
    if (typeof v === "number") return v
    if (typeof v === "object" && v !== null && "toNumber" in v) return (v as { toNumber: () => number }).toNumber()
    return Number(v)
  }
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: toNum(p.price),
    comparePrice: p.discountPrice ? toNum(p.discountPrice) : null,
    image: p.images[0] ?? null,
    category: p.category,
    stock: p.stock,
  }
}

export const getTrendingProducts = cached(
  (limit: number = 8) => fetchTrendingProducts(limit),
  "trending-products",
  [CACHE_TAGS.products, CACHE_TAGS.orders, CACHE_TAGS.featured],
)

export const getRelatedProducts = cached(
  (productId: string, categorySlug?: string | null, limit: number = 8) =>
    fetchRelatedProducts(productId, categorySlug, limit),
  "related-products",
  [CACHE_TAGS.products],
)

export const getFrequentlyBoughtTogether = cached(
  (productIds: string[], limit: number = 4) => fetchFrequentlyBoughtTogether(productIds, limit),
  "frequently-bought-together",
  [CACHE_TAGS.products, CACHE_TAGS.orders],
)

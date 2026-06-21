import "server-only"
import { prisma } from "@/lib/prisma"
import { cached, CACHE_TAGS } from "@/lib/cache"
import type { SanityProduct } from "@/sanity"

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  brand: true,
  price: true,
  discountPrice: true,
  stock: true,
  sku: true,
  images: true,
  status: true,
  createdAt: true,
} as const

function toSanityProduct(p: {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  brand: string | null
  price: { toNumber: () => number } | number
  discountPrice: { toNumber: () => number } | number | null
  stock: number
  sku: string
  images: string[]
  status: string
  createdAt: Date
}): SanityProduct {
  const toNum = (v: unknown): number => {
    if (v === null || v === undefined) return 0
    if (typeof v === "number") return v
    if (typeof v === "object" && v !== null && "toNumber" in v) return (v as { toNumber: () => number }).toNumber()
    return Number(v)
  }
  const firstImage = p.images[0] ? { url: p.images[0] } : undefined
  return {
    _id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? undefined,
    price: toNum(p.price),
    comparePrice: p.discountPrice ? toNum(p.discountPrice) : undefined,
    image: firstImage,
    images: p.images.length > 0
      ? p.images.map((url) => ({ url }))
      : firstImage
        ? [firstImage]
        : [],
    category: p.category
      ? { _id: p.category, title: p.category, slug: p.category.toLowerCase().replace(/\s+/g, "-") }
      : undefined,
    tags: [p.brand ?? ""].filter(Boolean),
    stock: p.stock,
  }
}

async function fetchStoreProducts(): Promise<SanityProduct[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: productSelect,
  })
  return products.map(toSanityProduct)
}

async function fetchStoreProductBySlug(slug: string): Promise<SanityProduct | null> {
  const product = await prisma.product.findUnique({
    where: { slug, deletedAt: null, status: "ACTIVE" },
    select: productSelect,
  })
  if (!product) return null
  return toSanityProduct(product)
}

async function fetchStoreProductById(id: string): Promise<SanityProduct | null> {
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null, status: "ACTIVE" },
    select: productSelect,
  })
  if (!product) return null
  return toSanityProduct(product)
}

async function fetchFeaturedStoreProducts(limit = 8): Promise<SanityProduct[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productSelect,
  })
  return products.map(toSanityProduct)
}

async function fetchStoreCategories(): Promise<{ title: string; slug: string }[]> {
  const categories = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  })
  return categories
    .filter((c) => c.category && c.category.trim().length > 0)
    .map((c) => ({
      title: c.category!,
      slug: c.category!.toLowerCase().replace(/\s+/g, "-"),
    }))
    .filter((c, i, arr) => arr.findIndex((x) => x.slug === c.slug) === i)
}

async function fetchStoreProductsByCategory(categorySlug: string): Promise<SanityProduct[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: productSelect,
  })
  return products
    .filter((p) => {
      if (!p.category) return false
      const slug = p.category.toLowerCase().replace(/\s+/g, "-")
      return slug === categorySlug
    })
    .map(toSanityProduct)
}

export const getStoreProducts = cached(fetchStoreProducts, "store-products", [
  CACHE_TAGS.products,
  CACHE_TAGS.categories,
])

export const getStoreProductBySlug = cached(fetchStoreProductBySlug, "store-product-by-slug", [CACHE_TAGS.products])

export const getStoreProductById = cached(fetchStoreProductById, "store-product-by-id", [CACHE_TAGS.products])

export const getFeaturedStoreProducts = cached(fetchFeaturedStoreProducts, "featured-products", [
  CACHE_TAGS.products,
  CACHE_TAGS.featured,
])

export const getStoreCategories = cached(fetchStoreCategories, "store-categories", [CACHE_TAGS.categories])

export const getStoreProductsByCategory = cached(fetchStoreProductsByCategory, "store-products-by-category", [
  CACHE_TAGS.products,
  CACHE_TAGS.categories,
])

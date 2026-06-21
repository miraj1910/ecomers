import { getTrendingProducts } from "@/actions/recommendations"
import { ProductGrid } from "./product-grid"
import type { SanityProduct } from "@/sanity"

export async function TrendingProducts() {
  let products: Awaited<ReturnType<typeof getTrendingProducts>> = []
  try {
    products = await getTrendingProducts(8)
  } catch (error) {
    console.error("Failed to load trending products:", error)
    return null
  }

  if (products.length === 0) return null

  const sanityProducts: SanityProduct[] = products.map((p) => ({
    _id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice ?? undefined,
    image: p.image ? { url: p.image } : undefined,
    images: p.image ? [{ url: p.image }] : [],
    category: p.category
      ? { _id: p.category, title: p.category, slug: p.category.toLowerCase().replace(/\s+/g, "-") }
      : undefined,
    stock: p.stock,
    tags: [],
  }))

  return (
    <section className="mt-20 mb-12">
      <h2 className="heading-section text-text-primary mb-8">
        Trending Now
      </h2>
      <ProductGrid products={sanityProducts} />
    </section>
  )
}

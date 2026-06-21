import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { ProductGrid } from "@/components/products/product-grid"
import {
  sanityFetch,
  productsByCategoryQuery,
  productsQuery,
  categoriesQuery,
  isSanityConfigured,
} from "@/sanity"
import {
  getAllProducts,
  getCategories,
  getProductsByCategory,
} from "@/lib/products"
import { getStoreProductsByCategory, getStoreCategories } from "@/actions/store-products"
import { siteConfig } from "@/lib/seo/metadata"
import type { SanityProduct, SanityCategory } from "@/sanity"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

const knownSlugs = ["all", "new-arrivals", "sale"] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!knownSlugs.includes(slug as typeof knownSlugs[number])) {
    let exists = false
    if (isSanityConfigured()) {
      const cats = await sanityFetch<SanityCategory[]>({
        query: categoriesQuery,
        tags: ["category"],
      })
      exists = cats.some((c) => c.slug === slug)
    } else {
      const cats = getCategories()
      exists = cats.some((c) => c.slug === slug)
    }

    if (!exists) {
      try {
        const dbCats = await getStoreCategories()
        exists = dbCats.some((c) => c.slug === slug)
      } catch (error) {
        console.error("Failed to check category existence:", error)
      }
    }

    if (!exists) notFound()
  }

  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const url = `${siteConfig.url}/category/${slug}`

  return {
    title: `${title} Collection`,
    description: `Browse our ${slug} collection.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} Collection — ${siteConfig.name}`,
      description: `Browse our ${slug} collection.`,
      url,
      siteName: siteConfig.name,
      images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Collection — ${siteConfig.name}`,
      description: `Browse our ${slug} collection.`,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  }
}

function mapMDXProduct(p: {
  title: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  category: string
  image: string
  tags: string[]
  featured: boolean
  inStock: boolean
  badge?: string | null
}): SanityProduct {
  return {
    _id: p.slug,
    name: p.title,
    slug: p.slug,
    description: p.description,
    price: p.price,
    comparePrice: p.comparePrice,
    image: { url: p.image },
    category: { _id: p.category, title: p.category, slug: p.category },
    tags: p.tags,
    featured: p.featured,
    stock: p.inStock ? 10 : 0,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const categoryTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  let products: SanityProduct[]

  if (isSanityConfigured()) {
    if (slug === "all" || slug === "new-arrivals") {
      products = await sanityFetch<SanityProduct[]>({
        query: productsQuery,
        tags: ["product"],
      })
    } else if (slug === "sale") {
      const all = await sanityFetch<SanityProduct[]>({
        query: productsQuery,
        tags: ["product"],
      })
      products = all.filter((p) => p.comparePrice != null && p.comparePrice > 0)
    } else {
      const cats = await sanityFetch<SanityCategory[]>({
        query: categoriesQuery,
        tags: ["category"],
      })
      const exists = cats.some((c) => c.slug === slug)
      if (!exists) {
        let dbCats: { title: string; slug: string }[] = []
        try {
          dbCats = await getStoreCategories()
        } catch (error) {
          console.error("Failed to load store categories:", error)
        }
        if (!dbCats.some((c) => c.slug === slug)) notFound()
        let dbProducts: SanityProduct[] = []
        try {
          dbProducts = await getStoreProductsByCategory(slug)
        } catch (error) {
          console.error("Failed to load products by category:", error)
        }
        return (
          <Section>
            <Container>
              <div className="mb-12">
                <span className="meta">Collection</span>
                <h1 className="heading-section mt-2 text-text-primary">{categoryTitle}</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  {dbProducts.length} {dbProducts.length === 1 ? "product" : "products"}
                </p>
              </div>
              <ProductGrid products={dbProducts} />
            </Container>
          </Section>
        )
      }

      products = await sanityFetch<SanityProduct[]>({
        query: productsByCategoryQuery,
        params: { slug },
        tags: [`category-${slug}`],
      })
    }
  } else {
    const allMDX = getAllProducts()

    if (slug === "all" || slug === "new-arrivals") {
      products = allMDX.map(mapMDXProduct)
    } else if (slug === "sale") {
      products = allMDX
        .filter((p) => p.comparePrice != null && p.comparePrice > 0)
        .map(mapMDXProduct)
    } else {
      const cats = getCategories()
      const exists = cats.some((c) => c.slug === slug)
      if (!exists) {
        let dbCats: { title: string; slug: string }[] = []
        try {
          dbCats = await getStoreCategories()
        } catch (error) {
          console.error("Failed to load store categories:", error)
        }
        if (!dbCats.some((c) => c.slug === slug)) notFound()
        let dbProducts: SanityProduct[] = []
        try {
          dbProducts = await getStoreProductsByCategory(slug)
        } catch (error) {
          console.error("Failed to load products by category:", error)
        }
        return (
          <Section>
            <Container>
              <div className="mb-12">
                <span className="meta">Collection</span>
                <h1 className="heading-section mt-2 text-text-primary">{categoryTitle}</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  {dbProducts.length} {dbProducts.length === 1 ? "product" : "products"}
                </p>
              </div>
              <ProductGrid products={dbProducts} />
            </Container>
          </Section>
        )
      }

      products = getProductsByCategory(slug).map(mapMDXProduct)
    }
  }

  let dbProducts: SanityProduct[] = []
  try {
    dbProducts = await getStoreProductsByCategory(slug)
  } catch (error) {
    console.error("Failed to load products by category:", error)
  }
  if (dbProducts.length > 0) {
    for (const dbp of dbProducts) {
      if (!products.find((p) => p.slug === dbp.slug)) {
        products.push(dbp)
      }
    }
  }

  return (
    <Section>
      <Container>
        <div className="mb-12">
          <span className="meta">Collection</span>
          <h1 className="heading-section mt-2 text-text-primary">{categoryTitle}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <ProductGrid products={products} />
      </Container>
    </Section>
  )
}

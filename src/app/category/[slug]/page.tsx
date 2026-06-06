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
import { getStoreProductsByCategory, getStoreProducts, getStoreCategories } from "@/actions/store-products"
import { siteConfig } from "@/lib/seo/metadata"
import type { SanityProduct, SanityCategory } from "@/sanity"

interface Props {
  params: Promise<{ slug: string }>
}

const knownSlugs = ["all", "new-arrivals", "sale"] as const

export async function generateStaticParams() {
  const slugs: { slug: string }[] = []

  if (isSanityConfigured()) {
    const cats = await sanityFetch<SanityCategory[]>({
      query: categoriesQuery,
    })
    slugs.push(...cats.map((c) => ({ slug: c.slug })))
  } else {
    const cats = getCategories()
    slugs.push(...cats.map((c) => ({ slug: c.slug })))
  }

  const dbCats = await getStoreCategories()
  for (const c of dbCats) {
    if (!slugs.find((s) => s.slug === c.slug)) {
      slugs.push({ slug: c.slug })
    }
  }

  slugs.push(...knownSlugs.map((s) => ({ slug: s })))
  return slugs
}

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
      const dbCats = await getStoreCategories()
      exists = dbCats.some((c) => c.slug === slug)
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
        const dbCats = await getStoreCategories()
        if (!dbCats.some((c) => c.slug === slug)) notFound()
        const dbProducts = await getStoreProductsByCategory(slug)
        return (
          <Section>
            <Container>
              <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {categoryTitle}
                </h1>
                <p className="mt-2 text-secondary">
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
        const dbCats = await getStoreCategories()
        if (!dbCats.some((c) => c.slug === slug)) notFound()
        const dbProducts = await getStoreProductsByCategory(slug)
        return (
          <Section>
            <Container>
              <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {categoryTitle}
                </h1>
                <p className="mt-2 text-secondary">
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

  const dbProducts = await getStoreProductsByCategory(slug)
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
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {categoryTitle}
          </h1>
          <p className="mt-2 text-secondary">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <ProductGrid products={products} />
      </Container>
    </Section>
  )
}

import type { Metadata } from "next"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { sanityFetch, productsQuery, categoriesQuery, isSanityConfigured } from "@/sanity"
import { getAllProducts, getCategories } from "@/lib/products"
import { getStoreProducts, getStoreCategories } from "@/actions/store-products"
import { siteConfig } from "@/lib/seo/metadata"
import type { SanityProduct } from "@/sanity"

export const revalidate = 60

interface Props {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our full collection of modern essentials.",
  alternates: { canonical: `${siteConfig.url}/products` },
  openGraph: {
    title: "Products — " + siteConfig.name,
    description: "Browse our full collection of modern essentials.",
    url: `${siteConfig.url}/products`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Products — " + siteConfig.name,
    description: "Browse our full collection of modern essentials.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, search, sort, minPrice, maxPrice } = await searchParams

  let sanityOrMdxProducts: SanityProduct[] = []

  if (isSanityConfigured()) {
    sanityOrMdxProducts = await sanityFetch<SanityProduct[]>({
      query: productsQuery,
      tags: ["product"],
    })
  } else {
    const mdxProducts = getAllProducts()
    sanityOrMdxProducts = mdxProducts.map((p) => ({
      _id: p.slug,
      name: p.title,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      image: { url: p.image },
      category: { _id: p.category, title: p.category, slug: p.category },
      tags: p.tags,
      sizes: p.sizes,
      featured: p.featured,
      stock: p.inStock ? 10 : 0,
    }))
  }

  let dbProducts: SanityProduct[] = []
  try {
    dbProducts = await getStoreProducts()
  } catch (error) {
    console.error("Failed to load products from database:", error)
  }

  const productMap = new Map<string, SanityProduct>()
  for (const p of sanityOrMdxProducts) {
    productMap.set(p.slug, p)
  }
  for (const p of dbProducts) {
    if (!productMap.has(p.slug)) {
      productMap.set(p.slug, p)
    }
  }
  const products = Array.from(productMap.values())

  let categoryList: { title: string; slug: string; image?: string }[]

  if (isSanityConfigured()) {
    const cats = await sanityFetch<{ _id: string; title: string; slug: string; image?: { url: string } }[]>({
      query: categoriesQuery,
      tags: ["category"],
    })
    categoryList = cats.map((c) => ({
      title: c.title,
      slug: c.slug,
      image: c.image?.url,
    }))
  } else {
    const mdxCategories = getCategories()
    categoryList = mdxCategories.map((c) => ({
      title: c.title,
      slug: c.slug,
      image: c.image,
    }))
  }

  let dbCategoryList: { title: string; slug: string }[] = []
  try {
    dbCategoryList = await getStoreCategories()
  } catch (error) {
    console.error("Failed to load store categories:", error)
  }
  for (const dbCat of dbCategoryList) {
    if (!categoryList.find((c) => c.slug === dbCat.slug)) {
      categoryList.push(dbCat)
    }
  }

  let filtered = [...products]

  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
    )
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice))
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice))
  }

  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price)
      break
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      break
  }

  return (
    <Section>
      <Container>
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="meta">Catalog</span>
            <h1 className="heading-section mt-2 text-text-primary">
              {category
                ? categoryList.find((c) => c.slug === category)?.title ?? "Products"
                : "All Products"}
            </h1>
          </div>
          <p className="text-sm text-text-secondary hidden sm:block">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <ProductFilters
            categories={categoryList}
            selectedCategory={category ?? "all"}
          />

          <div className="min-w-0 flex-1">
            <ProductGrid products={filtered} />
          </div>
        </div>
      </Container>
    </Section>
  )
}

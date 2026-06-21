import type { Metadata } from "next"
import { siteConfig } from "@/lib/seo/metadata"
import { LuxuryLanding } from "@/components/shared/luxury-landing"
import { getFeaturedStoreProducts } from "@/actions/store-products"

export const revalidate = 60

export const metadata: Metadata = {
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name + " — Timeless Objects & Apparel",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name + " — Timeless Objects & Apparel",
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: siteConfig.twitterHandle,
  },
}

export default async function HomePage() {
  let storeProducts: Awaited<ReturnType<typeof getFeaturedStoreProducts>> = []
  try {
    storeProducts = await getFeaturedStoreProducts(8)
  } catch (error) {
    console.error("Failed to load featured products from database:", error)
  }

  const products = storeProducts.map((p) => ({
    name: p.name,
    category: p.category?.title ?? null,
    price: p.price,
    discountPrice: p.comparePrice ?? null,
    image: p.image?.url ?? null,
    slug: p.slug,
    stock: p.stock ?? 0,
  }))

  return (
    <>
      <LuxuryLanding products={products} />
    </>
  )
}

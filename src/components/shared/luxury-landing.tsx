"use client"

import { HeroSection } from "./hero-section"
import { FeaturedProducts } from "./featured-products"
import { CategoriesSection } from "./categories-section"
import { JournalSection } from "./journal-section"
import { NewsletterSection } from "./newsletter-section"

interface FeaturedProductItem {
  name: string
  category: string | null
  price: number
  discountPrice: number | null
  image: string | null
  slug: string
  stock: number
}

export function LuxuryLanding({ products }: { products: FeaturedProductItem[] }) {
  return (
    <>
      <HeroSection />
      <FeaturedProducts products={products} />
      <CategoriesSection />
      <JournalSection />
      <NewsletterSection />
    </>
  )
}

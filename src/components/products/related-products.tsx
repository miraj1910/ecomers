import type { SanityProduct } from "@/sanity"
import { ProductGrid } from "./product-grid"

interface RelatedProductsProps {
  products: SanityProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-20 mb-12">
      <h2 className="heading-section text-text-primary mb-8">
        You might also like
      </h2>
      <ProductGrid products={products} />
    </section>
  )
}

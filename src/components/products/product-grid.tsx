import Link from "next/link"
import Image from "next/image"
import type { SanityProduct } from "@/sanity"

interface ProductGridProps {
  products: SanityProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="heading-product text-text-primary">No products found</h3>
        <p className="mt-3 text-sm text-text-secondary">
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <Link
          key={product._id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <article>
            <div className="product-image-container relative aspect-[4/5]">
              {product.image?.url && (
                <Image
                  src={product.image.url}
                  alt={product.image.alt ?? product.name}
                  fill
                  className="object-cover"
                  loading={index < 2 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              {(product.stock ?? 0) <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60">
                  <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-text-primary">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <p className="meta">
                {product.category?.title ?? "Product"}
              </p>
              <h3 className="heading-product text-text-primary">
                {product.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary">
                  ${product.price.toFixed(0)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-text-muted line-through">
                    ${product.comparePrice.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}

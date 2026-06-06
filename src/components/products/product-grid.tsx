import Link from "next/link"
import Image from "next/image"
import type { SanityProduct } from "@/sanity"

interface ProductGridProps {
  products: SanityProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface py-20 text-center">
        <div className="rounded-full border border-border bg-surface p-6 mb-4">
          <svg
            className="h-8 w-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l-2.25-2.25"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">No products found</h3>
        <p className="mt-1 text-sm text-secondary">
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <Link
          key={product._id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <article className="overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-border">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface">
              {product.image?.url && (
                <Image
                  src={product.image.url}
                  alt={product.image.alt ?? product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={index < 2 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              {(product.stock ?? 0) <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                  <span className="text-xs font-medium text-secondary">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-xs text-secondary mb-1 capitalize">
                {product.category?.title ?? "Product"}
              </p>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-accent">
                {product.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span className="text-xs text-muted line-through">
                    ${product.comparePrice.toFixed(2)}
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

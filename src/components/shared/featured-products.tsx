"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface FeaturedProductItem {
  name: string
  category: string | null
  price: number
  discountPrice: number | null
  image: string | null
  slug: string
  stock: number
}

export function FeaturedProducts({ products }: { products: FeaturedProductItem[] }) {
  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="editorial-container">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="editorial-kicker text-foreground">The Collection</h2>
          <Link
            href="/products"
            className="hidden items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-foreground transition-colors hover:text-secondary sm:flex"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`}>
              <div className="group">
                <div className="relative aspect-[1.42] overflow-hidden bg-[#E5DDD2]">
                  <Image
                    src={product.image ?? "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  {(product.stock ?? 0) <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
                      <span className="editorial-kicker text-foreground">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h3 className="max-w-full break-words text-[0.72rem] font-bold uppercase tracking-[0.16em] text-foreground [overflow-wrap:anywhere]">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-secondary">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-muted line-through">
                        ${product.discountPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-foreground transition-colors hover:text-secondary"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

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
    <section className="bg-bg-secondary py-24">
      <div className="editorial-container">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="meta">The Collection</span>
            <h2 className="heading-section mt-3 text-text-primary">New Arrivals</h2>
          </div>
          <Link
            href="/products"
            className="hidden text-[0.7rem] font-medium tracking-[0.15em] uppercase text-text-primary transition-colors hover:text-text-secondary sm:flex items-center gap-2"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/products/${product.slug}`} className="group block">
                <div className="product-image-container aspect-[4/5]">
                  <Image
                    src={product.image ?? "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
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
                    {product.category ?? "Product"}
                  </p>
                  <h3 className="heading-product text-text-primary">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary">
                      ${product.price.toFixed(0)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-text-muted line-through">
                        ${product.discountPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center sm:hidden">
          <Link
            href="/products"
            className="text-[0.7rem] font-medium tracking-[0.15em] uppercase text-text-primary flex items-center gap-2"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}

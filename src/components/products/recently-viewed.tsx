"use client"

import Image from "next/image"
import Link from "next/link"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"

export function RecentlyViewed() {
  const { items } = useRecentlyViewed()

  if (items.length === 0) return null

  const displayItems = items.slice(0, 6)

  return (
    <section className="bg-bg-primary py-16 sm:py-20">
      <div className="editorial-container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="heading-section text-text-primary">Recently Viewed</h2>
          {items.length > 6 && (
            <Link
              href="/products"
              className="text-[0.7rem] font-medium tracking-[0.15em] uppercase text-text-primary transition-colors hover:text-text-secondary"
            >
              View All
            </Link>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {displayItems.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="group w-36 shrink-0 sm:w-44"
            >
              <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="truncate text-xs font-medium text-text-primary">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

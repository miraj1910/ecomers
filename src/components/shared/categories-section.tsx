"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    title: "Clothing",
    description: "Modern essentials",
    slug: "clothing",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1100&q=85",
  },
  {
    title: "Accessories",
    description: "Considered finishing pieces",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1100&q=85",
  },
  {
    title: "Home",
    description: "Curated living",
    slug: "home",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1100&q=85",
  },
]

export function CategoriesSection() {
  return (
    <section className="bg-background pb-10 sm:pb-14">
      <div className="editorial-container">
        <div className="grid gap-5 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.slug}
            >
              <Link
                href={`/category/${category.slug}`}
                className="group relative block overflow-hidden bg-foreground"
              >
                <div className="relative h-[170px] overflow-hidden sm:h-auto sm:aspect-[3/1.05]">
                  <Image
                    src={category.image}
                    alt={`${category.title} collection`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover opacity-74 transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-black/28" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div>
                    <h3 className="font-serif text-3xl font-normal tracking-normal text-white sm:text-4xl">
                        {category.title}
                      </h3>
                    <p className="mt-4 inline-flex items-center gap-2 border-b border-white/80 pb-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-white">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

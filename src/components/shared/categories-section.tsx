"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

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
    <section className="bg-bg-primary py-24">
      <div className="editorial-container">
        <div className="mb-14">
          <span className="meta">Curated By</span>
          <h2 className="heading-section mt-3 text-text-primary">Categories</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {categories.map((category, i) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                href={`/category/${category.slug}`}
                className="group relative block overflow-hidden bg-bg-surface"
              >
                <div className="relative aspect-[4/5] lg:aspect-[3/4]">
                  <Image
                    src={category.image}
                    alt={`${category.title} collection`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-serif text-3xl font-normal text-text-primary">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

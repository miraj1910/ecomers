"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function JournalSection() {
  return (
    <section className="bg-bg-primary py-24">
      <div className="editorial-container">
        <div className="mb-14">
          <span className="meta">Journal</span>
          <h2 className="heading-section mt-3 text-text-primary">The Art of Living Well</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/blog"
            className="group grid overflow-hidden bg-bg-surface border border-border-subtle md:grid-cols-[1.2fr_1fr]"
          >
            <div className="relative min-h-[360px] md:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=85"
                alt="Coffee cup and book in warm morning light"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center px-10 py-12 md:px-14">
              <p className="meta">Featured Story</p>
              <h3 className="mt-4 heading-subsection text-text-primary">
                Stories, guides, and inspiration for a more intentional everyday.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary max-w-md">
                Explore our journal for curated stories on design, craftsmanship, and the art of living with intention.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.15em] uppercase text-text-primary">
                Read the Journal
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

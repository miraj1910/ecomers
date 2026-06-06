"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function JournalSection() {
  return (
    <section className="bg-background pb-8">
      <div className="editorial-container">
        <Link
          href="/blog"
          className="group grid min-h-[150px] overflow-hidden bg-[#ECE4D8] md:grid-cols-[1.1fr_1fr]"
        >
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
            <p className="editorial-kicker text-muted">Journal</p>
            <h2 className="mt-2 font-serif text-3xl font-normal leading-none tracking-normal text-foreground sm:text-4xl">
              The Art of Living Well
            </h2>
            <p className="mt-3 max-w-[390px] text-sm leading-6 text-secondary">
              Stories, guides, and inspiration for a more intentional and
              beautiful everyday.
            </p>
            <span className="mt-4 inline-flex w-fit items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-foreground">
              Read the Journal
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="relative min-h-[180px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=85"
              alt="Coffee cup and book in warm morning light"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
      </div>
    </section>
  )
}

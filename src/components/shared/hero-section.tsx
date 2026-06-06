"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function HeroSection() {
  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-[#D8D0C4] sm:min-h-[620px]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=2400&q=85"
          alt="Handmade ceramic vessel with dried branches on a stone plinth"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,242,234,0.94)_0%,rgba(247,242,234,0.76)_34%,rgba(247,242,234,0.16)_68%,rgba(24,21,17,0.08)_100%)]" />
      </div>

      <div className="editorial-container relative flex min-h-[72vh] items-center py-20 sm:min-h-[620px]">
        <div className="max-w-[620px]">
          <motion.h1
            variants={item}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-[3rem] font-normal leading-[0.98] tracking-normal text-[#8B7D6B] sm:text-[4.4rem] lg:text-[4.9rem]"
          >
            Timeless objects.
            <br />
            Thoughtfully made.
          </motion.h1>

          <motion.p
            variants={item}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-7 max-w-[420px] text-sm font-medium leading-7 text-[#8B7D6B] sm:text-base"
          >
            Curated pieces designed with intention, using premium materials
            and expert craftsmanship.
          </motion.p>

          <motion.div
            variants={item}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center"
          >
            <Link
              href="/category/new-arrivals"
              className="inline-flex h-10 items-center justify-center bg-foreground px-8 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-background transition-colors hover:bg-secondary"
            >
              Shop New Arrivals
            </Link>
            <Link
              href="/category/all"
              className="inline-flex h-10 items-center justify-center gap-2 border-b border-[#8B7D6B] text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#8B7D6B] transition-colors hover:text-secondary"
            >
              Explore Collections
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

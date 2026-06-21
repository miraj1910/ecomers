"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { WaterDropletCluster } from "@/components/droplets"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-bg-primary -mt-20 flex items-center overflow-hidden">
      <div className="editorial-container relative w-full py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="meta"
            >
              The Spring Collection
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-6 display-hero text-text-primary"
            >
              Timeless
              <br />
              <span className="text-text-secondary">Objects.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-lg leading-relaxed text-text-secondary max-w-md"
            >
              Curated pieces designed with intention, using premium materials
              and expert craftsmanship for a life well lived.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center"
            >
              <Link
                href="/category/new-arrivals"
                className="inline-flex h-14 items-center justify-center bg-text-primary px-10 text-[0.7rem] font-medium tracking-[0.15em] uppercase text-white transition-all hover:bg-accent-hover"
              >
                Shop New Arrivals
              </Link>
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.15em] uppercase text-text-secondary transition-colors hover:text-text-primary"
              >
                Explore Collections
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative hidden lg:block h-[70vh]"
          >
            <WaterDropletCluster density="dense" className="absolute inset-0" />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[0.55rem] font-medium tracking-[0.2em] uppercase text-text-muted">Scroll</span>
          <div className="h-8 w-[1px] bg-border-subtle" />
        </div>
      </motion.div>
    </section>
  )
}

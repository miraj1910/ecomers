"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

interface ProductFiltersProps {
  categories: { title: string; slug: string; image?: string }[]
  selectedCategory: string
  className?: string
}

export function ProductFilters({
  categories,
  selectedCategory,
  className,
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const createQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams]
  )

  const filtersContent = (
    <div className="space-y-8">
      <div>
        <h3 className="meta mb-4">Category</h3>
        <div className="flex flex-col gap-1.5">
          <Link
            href={createQuery({ category: "all" })}
            className={cn(
              "text-sm transition-colors py-1.5",
              selectedCategory === "all"
                ? "text-text-primary font-medium"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={createQuery({ category: cat.slug })}
              className={cn(
                "text-sm capitalize transition-colors py-1.5",
                selectedCategory === cat.slug
                  ? "text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="meta mb-4">Sort By</h3>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Newest", value: "" },
            { label: "Price: Low to High", value: "price-asc" },
            { label: "Price: High to Low", value: "price-desc" },
            { label: "Name", value: "name" },
          ].map((option) => (
            <Link
              key={option.value}
              href={createQuery({ sort: option.value || undefined })}
              className={cn(
                "text-sm transition-colors py-1.5",
                (searchParams.get("sort") ?? "") === option.value
                  ? "text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.1em] uppercase text-text-primary"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <aside className={cn("hidden lg:block w-56 shrink-0", className)}>
        {filtersContent}
      </aside>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/10" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="meta">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="h-8 w-8 flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersContent}
          </div>
        </div>
      )}
    </>
  )
}

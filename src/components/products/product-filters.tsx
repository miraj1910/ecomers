"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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

  return (
    <aside className={cn("w-full lg:w-64", className)}>
      <div className="bg-surface border border-border lg:sticky lg:top-24 space-y-6 rounded-2xl p-5">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Search</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <Input
              defaultValue={searchParams.get("search") ?? ""}
              placeholder="Search..."
              onChange={(e) => {
                const val = e.target.value
                router.push(createQuery({ search: val || undefined }))
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Category</h3>
          <div className="flex flex-col gap-1">
            <Link
              href={createQuery({ category: "all" })}
              className={cn(
                "rounded-xl px-3 py-2 text-sm transition-colors",
                selectedCategory === "all"
                  ? "bg-foreground/[0.1] font-medium text-foreground"
                  : "text-secondary hover:bg-foreground/[0.06] hover:text-foreground"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={createQuery({ category: cat.slug })}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm capitalize transition-colors",
                  selectedCategory === cat.slug
                    ? "bg-foreground/[0.1] font-medium text-foreground"
                    : "text-secondary hover:bg-foreground/[0.06] hover:text-foreground"
                )}
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Sort By</h3>
          <div className="flex flex-col gap-1">
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
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  (searchParams.get("sort") ?? "") === option.value
                    ? "bg-foreground/[0.1] font-medium text-foreground"
                    : "text-secondary hover:bg-foreground/[0.06] hover:text-foreground"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

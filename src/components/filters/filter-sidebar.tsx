"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { FilterGroup, PriceRange } from "@/types"

interface FilterSidebarProps {
  groups: FilterGroup[]
  selectedFilters: Record<string, string[]>
  priceRange: PriceRange
  onFilterChange: (groupId: string, value: string) => void
  onPriceRangeChange: (range: PriceRange) => void
  onClearFilters: () => void
  className?: string
}

function FilterGroupSection({
  group,
  selected,
  onFilterChange,
}: {
  group: FilterGroup
  selected: string[]
  onFilterChange: (groupId: string, value: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium"
        aria-expanded={open}
      >
        {group.label}
        {open ? (
          <ChevronUp className="h-4 w-4 text-secondary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-secondary" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-1">
              {group.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-secondary hover:text-foreground transition-colors"
                >
                  <input
                    type={group.type === "radio" ? "radio" : "checkbox"}
                    checked={selected.includes(option.id)}
                    onChange={() => onFilterChange(group.id, option.id)}
                    className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-secondary">
                      ({option.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FilterSidebar({
  groups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasActiveFilters = Object.values(selectedFilters).some(
    (arr) => arr.length > 0
  )

  const content = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-secondary hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {groups.map((group) => (
        <FilterGroupSection
          key={group.id}
          group={group}
          selected={selectedFilters[group.id] ?? []}
          onFilterChange={onFilterChange}
        />
      ))}
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <div className={cn("sticky top-24 w-56 shrink-0", className)}>
          {content}
        </div>
      </div>

      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
              {Object.values(selectedFilters).reduce(
                (acc, arr) => acc + arr.length,
                0
              )}
            </span>
          )}
        </Button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {content}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

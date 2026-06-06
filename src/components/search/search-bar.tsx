"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  onSearch,
  placeholder = "Search products...",
  className,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearchRef = useRef(onSearch)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const debouncedSearch = useCallback((value: string) => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearchRef.current?.(value)
    }, 300)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setQuery("")
    onSearch?.("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        if (onSearch) {
          onSearch(trimmed)
        } else {
          router.push(`/products?search=${encodeURIComponent(trimmed)}`)
        }
        inputRef.current?.blur()
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-11 items-center rounded-xl border bg-surface transition-all",
          focused ? "border-accent/50 ring-1 ring-accent/20" : "border-border"
        )}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-full w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
          aria-label="Search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="mr-2 text-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

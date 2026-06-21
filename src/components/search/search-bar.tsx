"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

type SearchResult = {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
}

export function SearchBar({
  onSearch,
  placeholder = "Search products...",
  className,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}&pageSize=6`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [query])

  const handleSubmit = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (onSearch) {
      onSearch(trimmed)
    } else {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`)
    }
    setFocused(false)
    setQuery("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit(query)
    }
  }

  const isOpen = focused && query.trim().length >= 2

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center border-b border-border-subtle pb-2">
        <Search className="h-4 w-4 shrink-0 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-full w-full bg-transparent px-3 text-base text-text-primary placeholder:text-text-muted/50 focus:outline-none"
          aria-label="Search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-border-subtle"
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onMouseDown={() => {
                      router.push(`/products/${product.slug}`)
                      setFocused(false)
                      setQuery("")
                      setResults([])
                    }}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left text-sm text-text-primary transition-colors hover:bg-border-subtle"
                  >
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-bg-secondary">
                      {product.image && (
                        <img
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{product.name}</p>
                      <p className="text-xs text-text-muted">${product.price.toFixed(0)}</p>
                    </div>
                  </button>
                </li>
              ))}
              <li className="border-t border-border-subtle">
                <button
                  onMouseDown={() => handleSubmit(query)}
                  className="flex w-full items-center justify-center px-4 py-3 text-xs text-text-primary hover:bg-border-subtle transition-colors"
                >
                  Search for &ldquo;{query}&rdquo;
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

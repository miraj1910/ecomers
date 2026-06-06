"use client"

import { useState, useRef, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import type { SearchSuggestion } from "@/lib/search"

interface SearchInputProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  getSuggestions?: (query: string) => SearchSuggestion[] | Promise<SearchSuggestion[]>
}

const RECENT_SEARCHES_KEY = "recent_searches"
const MAX_RECENT = 5

function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

export function SearchInput({
  placeholder = "Search products…",
  className,
  onSearch,
  onSuggestionSelect,
  getSuggestions,
}: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [, startTransition] = useTransition()

  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  const debouncedQuery = useDebounce(query, 200)

  const saveRecent = useCallback((q: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]") as string[]
      const updated = [q, ...stored.filter((s) => s !== q)].slice(0, MAX_RECENT)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      setRecentSearches(updated)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
    setRecentSearches([])
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      startTransition(() => setSuggestions([]))
      return
    }
    if (!getSuggestions) return
    let cancelled = false
    Promise.resolve(getSuggestions(debouncedQuery)).then((result) => {
      if (cancelled) return
      startTransition(() => setSuggestions(result))
    })
    return () => { cancelled = true }
  }, [debouncedQuery, getSuggestions, startTransition])

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

  const isOpen = focused && (query ? suggestions.length > 0 || true : recentSearches.length > 0)

  const handleSubmit = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    saveRecent(trimmed)
    setFocused(false)
    if (onSearch) {
      onSearch(trimmed)
    } else {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const item = items[selectedIndex]
        if (typeof item === "object" && "type" in item) {
          handleSuggestionClick(item)
        } else if (typeof item === "string") {
          handleSubmit(item)
        }
      }
    } else if (e.key === "Escape") {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setFocused(false)
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    } else {
      router.push(suggestion.href)
    }
  }

  const items: (string | SearchSuggestion)[] = query
    ? suggestions
    : recentSearches

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-8 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-background/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
        >
          {query ? (
            suggestions.length > 0 ? (
              <ul className="py-1" role="listbox">
                {suggestions.map((suggestion, i) => (
                  <li
                    key={`${suggestion.type}-${suggestion.label}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors",
                      i === selectedIndex ? "bg-accent text-white" : ""
                    )}
                    onMouseEnter={() => setSelectedIndex(i)}
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.type === "category" && (
                      <TrendingUp className="h-4 w-4 shrink-0 text-muted" />
                    )}
                    {suggestion.type === "product" && (
                      <Search className="h-4 w-4 shrink-0 text-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{suggestion.label}</span>
                      {suggestion.sublabel && (
                        <span className="text-xs text-muted">
                          {suggestion.sublabel}
                        </span>
                      )}
                    </div>
                    {suggestion.type === "product" && suggestion.sublabel && (
                      <span className="shrink-0 text-xs text-muted">
                        {suggestion.sublabel}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted">
                No results for &ldquo;{query}&rdquo;
              </div>
            )
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-muted">
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <ul className="pb-1" role="listbox">
                {recentSearches.map((q, i) => (
                  <li
                    key={q}
                    role="option"
                    aria-selected={i === selectedIndex}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors",
                      i === selectedIndex ? "bg-accent text-white" : ""
                    )}
                    onMouseEnter={() => setSelectedIndex(i)}
                    onMouseDown={() => handleSubmit(q)}
                  >
                    <Clock className="h-4 w-4 shrink-0 text-muted" />
                    <span className="truncate">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

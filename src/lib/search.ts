export interface SearchableProduct {
  slug: string
  name: string
  description: string | null
  price: number
  comparePrice: number | null
  image: string | null
  category: string | null
  tags: string[]
}

export interface SearchSuggestion {
  type: "product" | "category" | "query"
  label: string
  href: string
  sublabel?: string
}

function score(text: string, query: string): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()

  if (lower === q) return 100
  if (lower.startsWith(q)) return 80
  if (lower.includes(` ${q}`)) return 60
  if (lower.includes(q)) return 40

  const words = q.split(/\s+/)
  const matchCount = words.filter((w) => lower.includes(w)).length
  return (matchCount / words.length) * 30
}

export function searchProducts(
  products: SearchableProduct[],
  query: string
): SearchableProduct[] {
  if (!query.trim()) return []

  const q = query.toLowerCase().trim()
  const scored = products
    .map((p) => {
      let best = 0
      best = Math.max(best, score(p.name, q))
      if (p.description) best = Math.max(best, score(p.description, q))
      if (p.tags) p.tags.forEach((t) => (best = Math.max(best, score(t, q))))
      if (p.category) best = Math.max(best, score(p.category, q))
      return { product: p, score: best }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map(({ product }) => product)
}

export function getSearchSuggestions(
  products: SearchableProduct[],
  categories: { title: string; slug: string }[],
  query: string
): SearchSuggestion[] {
  if (!query.trim()) return []

  const q = query.toLowerCase().trim()
  const suggestions: SearchSuggestion[] = []

  const matchedProducts = searchProducts(products, q).slice(0, 5)
  for (const p of matchedProducts) {
    suggestions.push({
      type: "product",
      label: p.name,
      href: `/products/${p.slug}`,
      sublabel: `$${p.price.toFixed(2)}`,
    })
  }

  if (suggestions.length < 5) {
    for (const c of categories) {
      if (
        !suggestions.some((s) => s.label === c.title) &&
        score(c.title, q) > 0
      ) {
        suggestions.push({
          type: "category",
          label: c.title,
          href: `/products?category=${c.slug}`,
        })
      }
    }
  }

  return suggestions.slice(0, 8)
}

export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text

  const q = query.trim()
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  return text.replace(regex, "___hl___$1___/hl___")
}

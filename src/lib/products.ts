import { getAllMDXContent, getMDXContentBySlug } from "@/lib/content"
import type { ProductFrontmatter, CategoryFrontmatter } from "@/types/content"

export function getFeaturedProducts(): ProductFrontmatter[] {
  const all = getAllMDXContent<ProductFrontmatter>("products")
  return all
    .filter((p) => p.frontmatter.featured)
    .slice(0, 4)
    .map((p) => ({
      ...p.frontmatter,
      badge: p.frontmatter.badge === "null" ? undefined : p.frontmatter.badge ?? undefined,
    }))
}

export function getAllProducts(): ProductFrontmatter[] {
  return getAllMDXContent<ProductFrontmatter>("products").map((p) => ({
    ...p.frontmatter,
    badge: p.frontmatter.badge === "null" ? undefined : p.frontmatter.badge ?? undefined,
  }))
}

export function getProductBySlug(slug: string) {
  const p = getMDXContentBySlug<ProductFrontmatter>("products", slug)
  if (!p) return null
  return {
    ...p,
    frontmatter: {
      ...p.frontmatter,
      badge: p.frontmatter.badge === "null" ? undefined : p.frontmatter.badge ?? undefined,
    },
  }
}

export function getCategories(): CategoryFrontmatter[] {
  return getAllMDXContent<CategoryFrontmatter>("categories").map((p) => p.frontmatter)
}

export function getProductsByCategory(slug: string): ProductFrontmatter[] {
  return getAllProducts().filter((p) => p.category === slug)
}

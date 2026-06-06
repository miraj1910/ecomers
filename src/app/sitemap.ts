import type { MetadataRoute } from "next"
import { isSanityConfigured, sanityFetch, productsQuery, categoriesQuery } from "@/sanity"
import type { SanityProduct, SanityCategory } from "@/sanity"
import { getAllProducts, getCategories } from "@/lib/products"
import { getMDXContentBySlug, getAllSlugs } from "@/lib/content"
import type { BlogFrontmatter } from "@/types/content"
import { siteConfig } from "@/lib/seo/metadata"

type SitemapEntry = {
  url: string
  lastModified?: Date | string
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}

const staticPages: SitemapEntry[] = [
  { url: `${siteConfig.url}`, changeFrequency: "weekly", priority: 1.0 },
  { url: `${siteConfig.url}/products`, changeFrequency: "daily", priority: 0.9 },
  { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [...staticPages]

  if (isSanityConfigured()) {
    try {
      const products = await sanityFetch<SanityProduct[]>({ query: productsQuery })
      for (const p of products) {
        entries.push({
          url: `${siteConfig.url}/products/${p.slug}`,
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    } catch {
      // fallback to MDX
    }

    try {
      const categories = await sanityFetch<SanityCategory[]>({ query: categoriesQuery })
      for (const c of categories) {
        entries.push({
          url: `${siteConfig.url}/category/${c.slug}`,
          changeFrequency: "weekly",
          priority: 0.6,
        })
      }
    } catch {
      // fallback to MDX
    }
  } else {
    const products = getAllProducts()
    for (const p of products) {
      entries.push({
        url: `${siteConfig.url}/products/${p.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }

    const categories = getCategories()
    for (const c of categories) {
      entries.push({
        url: `${siteConfig.url}/category/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }

    for (const slug of ["new-arrivals", "sale"]) {
      entries.push({
        url: `${siteConfig.url}/category/${slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  const blogSlugs = getAllSlugs("blog")
  for (const slug of blogSlugs) {
    const post = getMDXContentBySlug<BlogFrontmatter>("blog", slug)
    if (post && post.frontmatter.published) {
      entries.push({
        url: `${siteConfig.url}/blog/${slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }
  }

  return entries
}

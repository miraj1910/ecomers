import { siteConfig } from "./metadata"

export type JsonLd<T = Record<string, unknown>> = T & {
  "@context": "https://schema.org"
  "@type": string
}

const siteUrl = siteConfig.url

export function productSchema(product: {
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice?: number | null
  image?: string | null
  category?: string | null
  currency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  sku?: string
  review?: {
    ratingValue: number
    reviewCount: number
  } | null
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.image ?? undefined,
    sku: product.sku ?? product.slug,
    category: product.category ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency ?? "USD",
      availability: `https://schema.org/${product.availability ?? "InStock"}`,
      url: `${siteUrl}/products/${product.slug}`,
      ...(product.comparePrice
        ? { priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] }
        : {}),
    },
    ...(product.review && product.review.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.review.ratingValue,
            reviewCount: product.review.reviewCount,
          },
        }
      : {}),
  }
}

export function breadcrumbSchema(items: { name: string; href: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  }
}

export function organizationSchema(org: {
  name?: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[]
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name ?? "STORE",
    url: org.url ?? siteUrl,
    logo: org.logo ?? undefined,
    description: org.description ?? undefined,
    sameAs: org.sameAs ?? undefined,
  }
}

export function websiteSchema(org: {
  name?: string
  url?: string
  searchUrl?: string
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: org.name ?? "STORE",
    url: org.url ?? siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          org.searchUrl ??
          `${siteUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function blogPostSchema(post: {
  headline: string
  description: string | null
  image: string | null
  datePublished: string
  dateModified?: string
  author?: string
  url: string
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.headline,
    description: post.description ?? undefined,
    image: post.image ?? undefined,
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: {
      "@type": "Person",
      name: post.author ?? "STORE",
    },
    url: post.url,
    publisher: {
      "@type": "Organization",
      name: "STORE",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.url,
    },
  }
}

export function collectionPageSchema(collection: {
  name: string
  description: string | null
  url: string
  totalProducts?: number
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description ?? undefined,
    url: collection.url,
    ...(collection.totalProducts != null
      ? { numberOfItems: collection.totalProducts }
      : {}),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [] as never[],
    },
  }
}

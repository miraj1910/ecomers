import type { Metadata } from "next"

export const siteConfig = {
  name: "STORE",
  description: "Curated modern essentials for the minimalist lifestyle. Premium quality pieces designed to last.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image",
  locale: "en_US",
  twitterHandle: "@store",
}

type OpenGraphImage = {
  url: string | URL
  width?: number
  height?: number
  alt?: string
}

type PageSeoInput = {
  title: string
  description: string
  path: string
  images?: OpenGraphImage[]
  noIndex?: boolean
  canonical?: string
  keywords?: string[]
  publishedTime?: string
  modifiedTime?: string
}

export function buildMetadata(page: PageSeoInput): Metadata {
  const url = `${siteConfig.url}${page.path}`
  const ogImages = page.images?.length
    ? page.images
    : [{ url: `${siteConfig.url}${siteConfig.ogImage}` }]

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: page.canonical ?? url,
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: ogImages,
      ...(page.publishedTime ? { publishedTime: page.publishedTime } : {}),
      ...(page.modifiedTime ? { modifiedTime: page.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ogImages,
      creator: siteConfig.twitterHandle,
    },
  }
}

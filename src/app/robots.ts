import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo/metadata"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/orders/", "/profile/", "/wishlist/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}

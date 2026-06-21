import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Providers } from "./providers"
import { Shell } from "@/components/layout/shell"
import { ToastContainer } from "@/components/shared/toast-container"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { organizationSchema, websiteSchema } from "@/lib/seo/json-ld"
import { siteConfig } from "@/lib/seo/metadata"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name + " — Timeless Objects & Apparel",
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["ecommerce", "fashion", "minimalist", "modern", "store", "luxury"],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name + " — Timeless Objects & Apparel",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name + " — Timeless Objects & Apparel",
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: siteConfig.url,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <JsonLdScript
          data={[
            organizationSchema({
              name: siteConfig.name,
              url: siteConfig.url,
            }),
            websiteSchema({
              name: siteConfig.name,
              url: siteConfig.url,
            }),
          ]}
        />
        <Providers>
          <Shell>{children}</Shell>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}

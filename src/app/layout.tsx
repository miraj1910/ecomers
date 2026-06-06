import "@/lib/env"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { Providers } from "./providers"
import { Shell } from "@/components/layout/shell"
import { ToastContainer } from "@/components/shared/toast-container"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { organizationSchema, websiteSchema } from "@/lib/seo/json-ld"
import { siteConfig } from "@/lib/seo/metadata"
import { themeScript } from "@/lib/theme-script"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name + " — Modern Essentials",
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["ecommerce", "fashion", "minimalist", "modern", "store"],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name + " — Modern Essentials",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name + " — Modern Essentials",
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
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get("theme")?.value
  const themeClass =
    themeCookie === "light" || themeCookie === "dark"
      ? themeCookie
      : "light"

  return (
    <html
      lang="en"
      className={`${inter.variable} ${themeClass}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div
          className="hidden"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<script id="theme-init">${themeScript}</script>`,
          }}
        />
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

import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { breadcrumbSchema } from "@/lib/seo/json-ld"
import { components } from "@/components/mdx/mdx-components"
import { getMDXContentBySlug } from "@/lib/content"
import { siteConfig } from "@/lib/seo/metadata"
import type { PageFrontmatter } from "@/types/content"

export const metadata: Metadata = {
  title: "About",
  description: "Our story and mission.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About — " + siteConfig.name,
    description: "Our story and mission.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — " + siteConfig.name,
    description: "Our story and mission.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
}

export default function AboutPage() {
  const page = getMDXContentBySlug<PageFrontmatter>("pages", "about")

  return (
    <Section>
      <Container>
        <JsonLdScript
          data={breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ])}
        />
        <div className="bg-surface border border-border mx-auto max-w-3xl rounded-3xl p-8 sm:p-12">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8">
            {page?.frontmatter.title ?? "About"}
          </h1>
          <div className="prose-custom">
            <MDXRemote
              source={page?.content ?? ""}
              components={components}
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

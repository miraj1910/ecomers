import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { getAllMDXContent } from "@/lib/content"
import { siteConfig } from "@/lib/seo/metadata"
import type { BlogFrontmatter } from "@/types/content"

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, guides, and insights from the ATELIER team.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Journal — " + siteConfig.name,
    description: "Stories, guides, and insights from the ATELIER team.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal — " + siteConfig.name,
    description: "Stories, guides, and insights from the ATELIER team.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
}

export default function BlogPage() {
  const posts = getAllMDXContent<BlogFrontmatter>("blog")
    .filter((p) => p.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )

  return (
    <Section>
      <Container>
        <div className="mb-16 max-w-2xl">
          <span className="meta">Journal</span>
          <h1 className="heading-hero mt-3 text-text-primary">
            The Art of Living Well
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Stories, guides, and inspiration for a more intentional and beautiful everyday.
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-2">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article>
                <div className="product-image-container relative aspect-[4/3]">
                  <Image
                    src={post.frontmatter.coverImage}
                    alt={post.frontmatter.title}
                    fill
                    className="object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-6 space-y-3">
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.frontmatter.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[0.55rem] font-medium tracking-[0.1em] uppercase text-text-secondary bg-border-subtle px-2.5 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="heading-product text-text-primary group-hover:text-text-secondary transition-colors">
                    {post.frontmatter.title}
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}

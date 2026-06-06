import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Badge } from "@/components/ui/badge"
import { getAllMDXContent } from "@/lib/content"
import { siteConfig } from "@/lib/seo/metadata"
import type { BlogFrontmatter } from "@/types/content"

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, guides, and insights from the STORE team.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Blog — " + siteConfig.name,
    description: "Stories, guides, and insights from the STORE team.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — " + siteConfig.name,
    description: "Stories, guides, and insights from the STORE team.",
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
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-secondary">
            Stories, guides, and insights from the STORE team.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 group-hover:border-white/[0.12]">
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <Image
                    src={post.frontmatter.coverImage}
                    alt={post.frontmatter.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.frontmatter.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold leading-snug text-white group-hover:text-accent">
                    {post.frontmatter.title}
                  </h2>
                  <p className="mt-2 text-sm text-secondary line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                  <p className="mt-4 text-xs text-muted">
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

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import Image from "next/image"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { blogPostSchema, breadcrumbSchema } from "@/lib/seo/json-ld"
import { components } from "@/components/mdx/mdx-components"
import { getMDXContentBySlug, getAllSlugs } from "@/lib/content"
import { siteConfig } from "@/lib/seo/metadata"
import type { BlogFrontmatter } from "@/types/content"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs("blog")
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getMDXContentBySlug<BlogFrontmatter>("blog", slug)
  if (!post) return {}

  const url = `${siteConfig.url}/blog/${slug}`
  const ogImage = post.frontmatter.coverImage
    ? { url: post.frontmatter.coverImage, width: 1200, height: 630, alt: post.frontmatter.title }
    : { url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "STORE Blog" }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.frontmatter.date,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [ogImage.url],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getMDXContentBySlug<BlogFrontmatter>("blog", slug)
  if (!post || !post.frontmatter.published) notFound()

  const url = `${siteConfig.url}/blog/${slug}`

  return (
    <article>
      <JsonLdScript
        data={[
          blogPostSchema({
            headline: post.frontmatter.title,
            description: post.frontmatter.description,
            image: post.frontmatter.coverImage,
            datePublished: post.frontmatter.date,
            author: post.frontmatter.author,
            url,
          }),
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: post.frontmatter.title, href: `/blog/${slug}` },
          ]),
        ]}
      />
      <div className="relative h-[40vh] min-h-[300px] bg-muted">
        <Image
          src={post.frontmatter.coverImage}
          alt={post.frontmatter.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <Container>
        <div className="mx-auto max-w-2xl -mt-20 relative z-10">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm sm:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.frontmatter.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl mb-3">
              {post.frontmatter.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-secondary mb-8 pb-8 border-b border-border">
              <span>{post.frontmatter.author ?? "STORE"}</span>
              <span>&middot;</span>
              <time>
                {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <div className="prose-custom">
              <MDXRemote
                source={post.content}
                components={components}
              />
            </div>
          </div>
        </div>
      </Container>
    </article>
  )
}

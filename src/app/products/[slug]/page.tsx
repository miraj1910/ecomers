import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import {
  ProductGallery,
  ProductInfo,
  ProductActions,
  RelatedProducts,
} from "@/components/products"
import { RecentlyViewedTracker } from "@/components/products/recently-viewed-tracker"
import { TrendingProducts } from "@/components/products/trending-products"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { productSchema, breadcrumbSchema } from "@/lib/seo/json-ld"
import {
  sanityFetch,
  productBySlugQuery,
  relatedProductsQuery,
  isSanityConfigured,
} from "@/sanity"
import { getProductBySlug, getAllProducts } from "@/lib/products"
import { getStoreProductBySlug, getStoreProducts } from "@/actions/store-products"
import { getRelatedProducts } from "@/actions/recommendations"
import { auth } from "@/lib/auth"
import { getProductRating } from "@/actions/reviews"
import { siteConfig } from "@/lib/seo/metadata"
import type { SanityProduct } from "@/sanity"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

async function findProduct(slug: string): Promise<SanityProduct | null> {
  if (isSanityConfigured()) {
    const product = await sanityFetch<SanityProduct | null>({
      query: productBySlugQuery,
      params: { slug },
    })
    if (product) return product
  } else {
    const mdx = getProductBySlug(slug)
    if (mdx) {
      return {
        _id: slug,
        name: mdx.frontmatter.title,
        slug,
        description: mdx.frontmatter.description,
        price: mdx.frontmatter.price,
        comparePrice: mdx.frontmatter.comparePrice,
        image: { url: mdx.frontmatter.image },
        tags: mdx.frontmatter.tags,
        sizes: mdx.frontmatter.sizes,
        stock: mdx.frontmatter.inStock ? 10 : 0,
      }
    }
  }

  try {
    const dbProduct = await getStoreProductBySlug(slug)
    return dbProduct
  } catch (error) {
    console.error("Failed to load product from database:", error)
    return null
  }
}

async function findProductFull(slug: string): Promise<{
  product: SanityProduct | null
  related: SanityProduct[]
}> {
  let product: SanityProduct | null = null
  let related: SanityProduct[] = []

  if (isSanityConfigured()) {
    product = await sanityFetch<SanityProduct | null>({
      query: productBySlugQuery,
      params: { slug },
      tags: [`product-${slug}`],
    })
    if (product?.category?.slug) {
      related = await sanityFetch<SanityProduct[]>({
        query: relatedProductsQuery,
        params: { slug: product.category.slug, currentSlug: slug },
      })
    }
  } else {
    const mdx = getProductBySlug(slug)
    if (mdx) {
      product = {
        _id: slug,
        name: mdx.frontmatter.title,
        slug,
        description: mdx.frontmatter.description,
        price: mdx.frontmatter.price,
        comparePrice: mdx.frontmatter.comparePrice,
        images: mdx.frontmatter.images.map((u) => ({ url: u })),
        image: { url: mdx.frontmatter.image },
        category: {
          _id: mdx.frontmatter.category,
          title: mdx.frontmatter.category,
          slug: mdx.frontmatter.category,
        },
        tags: mdx.frontmatter.tags,
        sizes: mdx.frontmatter.sizes,
        featured: mdx.frontmatter.featured,
        stock: mdx.frontmatter.inStock ? 10 : 0,
      }
      const all = getAllProducts()
        .filter(
          (p) =>
            p.category === mdx.frontmatter.category &&
            p.slug !== mdx.frontmatter.slug
        )
        .slice(0, 4)
      related = all.map((p) => ({
        _id: p.slug,
        name: p.title,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        image: { url: p.image },
        category: { _id: p.category, title: p.category, slug: p.category },
        stock: p.inStock ? 10 : 0,
      }))
    }
  }

  if (!product) {
    try {
      const dbProduct = await getStoreProductBySlug(slug)
      if (dbProduct) {
        product = dbProduct
        const recs = await getRelatedProducts(
          dbProduct._id,
          dbProduct.category?.slug,
          4
        )
        related = recs.map((r) => ({
          _id: r.id,
          name: r.name,
          slug: r.slug,
          price: r.price,
          comparePrice: r.comparePrice ?? undefined,
          image: r.image ? { url: r.image } : undefined,
          images: r.image ? [{ url: r.image }] : [],
          category: r.category
            ? { _id: r.category, title: r.category, slug: r.category.toLowerCase().replace(/\s+/g, "-") }
            : undefined,
          stock: r.stock,
          tags: [],
        }))
      }
    } catch (error) {
      console.error("Failed to load product data from database:", error)
    }
  }

  return { product, related }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let product: SanityProduct | null = null
  try {
    product = await findProduct(slug)
  } catch (error) {
    console.error("Failed to load product metadata:", error)
  }

  if (!product) notFound()

  const url = `${siteConfig.url}/products/${slug}`
  const ogImage = product.image?.url
    ? { url: product.image.url, width: 1200, height: 1200, alt: product.name }
    : { url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: product.name }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? undefined,
      images: [ogImage.url],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  let product: SanityProduct | null = null
  let related: SanityProduct[] = []
  try {
    const result = await findProductFull(slug)
    product = result.product
    related = result.related
  } catch (error) {
    console.error("Failed to load product details from database:", error)
  }

  if (!product) notFound()

  let productRating: Awaited<ReturnType<typeof getProductRating>> | null = null
  try {
    productRating = await getProductRating(slug)
  } catch (error) {
    console.error("Failed to load product rating:", error)
  }

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : []

  const categorySlug = product.category?.slug ?? ""
  const categoryTitle = product.category?.title ?? "Products"

  return (
    <article>
      <JsonLdScript
        data={[
          productSchema({
            name: product.name,
            slug,
            description: product.description ?? null,
            price: product.price,
            comparePrice: product.comparePrice,
            image: images[0]?.url ?? null,
            category: categoryTitle,
            availability: (product.stock ?? 0) > 0 ? "InStock" : "OutOfStock",
            review: productRating
              ? {
                  ratingValue: productRating.averageRating,
                  reviewCount: productRating.totalRatings,
                }
              : null,
          }),
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: categoryTitle, href: `/products?category=${categorySlug}` },
            { name: product.name, href: `/products/${slug}` },
          ]),
        ]}
      />
      <Container>
        <nav className="flex items-center gap-2 py-8 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/products?category=${categorySlug}`}
            className="hover:text-text-primary transition-colors capitalize"
          >
            {categoryTitle}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-primary truncate">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <ProductGallery images={images} productName={product.name} />

          <div className="flex flex-col lg:sticky lg:top-28 lg:self-start">
            <ProductInfo
              name={product.name}
              description={product.description}
              price={product.price}
              comparePrice={product.comparePrice}
              category={product.category}
              tags={product.tags}
              stock={product.stock}
              rating={productRating}
            />

            <div className="mt-10 pt-10 border-t border-border-subtle">
              <ProductActions
                productId={product._id}
                slug={slug}
                name={product.name}
                price={product.price}
                image={images[0]?.url ?? ""}
                sizes={product.sizes}
                inStock={(product.stock ?? 0) > 0}
              />
            </div>

            <div className="mt-10 pt-10 border-t border-border-subtle space-y-6">
              <div>
                <h4 className="meta">Materials</h4>
                <p className="mt-2 text-sm text-text-primary">Premium quality materials sourced from trusted suppliers.</p>
              </div>
              <div>
                <h4 className="meta">Dimensions</h4>
                <p className="mt-2 text-sm text-text-primary">Standard sizing. See size guide for exact measurements.</p>
              </div>
              <div>
                <h4 className="meta">Shipping</h4>
                <p className="mt-2 text-sm text-text-primary">Free shipping on orders over $100. Estimated delivery 3-5 business days.</p>
              </div>
              <div>
                <h4 className="meta">Care</h4>
                <p className="mt-2 text-sm text-text-primary">Follow care instructions to maintain quality and longevity.</p>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts products={related} />

        <TrendingProducts />

        <section className="mt-24 border-t border-border-subtle pt-16 pb-24">
          <h2 className="heading-section text-text-primary mb-10">Customer Reviews</h2>
          <ReviewsSection
            productId={slug}
            currentUserId={session?.user?.id ?? null}
          />
        </section>
      </Container>

      <RecentlyViewedTracker
        slug={slug}
        name={product.name}
        price={product.price}
        image={images[0]?.url ?? null}
        category={product.category?.title ?? null}
      />
    </article>
  )
}

"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CACHE_TAGS } from "@/lib/cache"
import { createReviewSchema, updateReviewSchema } from "@/lib/validations/reviews"
import type { ReviewItem, ReviewPageData, ProductRatingSummary, ServerActionResult } from "@/types/prisma"

function computeDistribution(reviews: { rating: number }[]): number[] {
  const dist = [0, 0, 0, 0, 0]
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      dist[r.rating - 1]++
    }
  }
  return dist
}

async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  })

  const totalRatings = reviews.length
  const distribution = computeDistribution(reviews)
  const averageRating =
    totalRatings > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0

  await prisma.productRating.upsert({
    where: { productId },
    create: { productId, averageRating, totalRatings, distribution },
    update: { averageRating, totalRatings, distribution },
  })
}

export async function createReview(
  input: unknown
): Promise<ServerActionResult<ReviewItem>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to leave a review" }
    }

    const parsed = createReviewSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
    })

    if (existing) {
      return { success: false, error: "You have already reviewed this product" }
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        title: parsed.data.title ?? null,
        comment: parsed.data.comment ?? null,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    await updateProductRating(parsed.data.productId)
    const reviewedProduct = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { slug: true },
    })
    if (reviewedProduct) {
      revalidatePath(`/products/${reviewedProduct.slug}`)
    }

    return { success: true, data: review as ReviewItem }
  } catch (error) {
    console.error("Create review error:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function updateReview(
  reviewId: string,
  input: unknown
): Promise<ServerActionResult<ReviewItem>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = updateReviewSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const existing = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!existing) return { success: false, error: "Review not found" }
    if (existing.userId !== session.user.id) return { success: false, error: "You can only edit your own reviews" }

    const data: Record<string, unknown> = {}
    if (parsed.data.rating !== undefined) data.rating = parsed.data.rating
    if (parsed.data.title !== undefined) data.title = parsed.data.title
    if (parsed.data.comment !== undefined) data.comment = parsed.data.comment

    const review = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    await updateProductRating(review.productId)
    const updatedProduct = await prisma.product.findUnique({
      where: { id: review.productId },
      select: { slug: true },
    })
    if (updatedProduct) {
      revalidatePath(`/products/${updatedProduct.slug}`)
    }
    revalidateTag(CACHE_TAGS.products, 'max')

    return { success: true, data: review as ReviewItem }
  } catch (error) {
    console.error("Update review error:", error)
    return { success: false, error: "Failed to update review" }
  }
}

export async function deleteReview(reviewId: string): Promise<ServerActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const existing = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!existing) return { success: false, error: "Review not found" }
    if (existing.userId !== session.user.id) return { success: false, error: "You can only delete your own reviews" }

    await prisma.review.delete({ where: { id: reviewId } })
    await updateProductRating(existing.productId)
    const deletedProduct = await prisma.product.findUnique({
      where: { id: existing.productId },
      select: { slug: true },
    })
    if (deletedProduct) {
      revalidatePath(`/products/${deletedProduct.slug}`)
    }
    revalidateTag(CACHE_TAGS.products, 'max')

    return { success: true }
  } catch (error) {
    console.error("Delete review error:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

export async function getProductReviews(
  productId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ReviewPageData> {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.review.count({ where: { productId } }),
  ])

  return {
    reviews: reviews as ReviewItem[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getProductRating(productId: string): Promise<ProductRatingSummary | null> {
  const rating = await prisma.productRating.findUnique({ where: { productId } })

  if (!rating) {
    const reviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } })
    if (reviews.length === 0) return null

    const distribution = computeDistribution(reviews)
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    return { productId, averageRating, totalRatings: reviews.length, distribution }
  }

  return rating as unknown as ProductRatingSummary
}

export async function getUserReview(productId: string): Promise<ServerActionResult<ReviewItem | null>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: true, data: null }

    const review = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    return { success: true, data: (review as ReviewItem) ?? null }
  } catch (error) {
    console.error("Get user review error:", error)
    return { success: false, error: "Failed to fetch review" }
  }
}

export async function getUserReviews(
  page: number = 1,
  pageSize: number = 10
): Promise<ServerActionResult<ReviewPageData>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, image: true } } },
      }),
      prisma.review.count({ where: { userId: session.user.id } }),
    ])

    return {
      success: true,
      data: { reviews: reviews as ReviewItem[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    }
  } catch (error) {
    console.error("Get user reviews error:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

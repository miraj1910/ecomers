"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { ServerActionResult } from "@/types/prisma"

export async function addToWishlist(
  productId: string
): Promise<ServerActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existing) {
      return { success: true }
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath("/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return { success: false, error: "Failed to add to wishlist" }
  }
}

export async function removeFromWishlist(
  productId: string
): Promise<ServerActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath("/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return { success: false, error: "Failed to remove from wishlist" }
  }
}

export async function getWishlist(): Promise<
  ServerActionResult<string[]>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: items.map((item) => item.productId),
    }
  } catch (error) {
    console.error("Get wishlist error:", error)
    return { success: false, error: "Failed to fetch wishlist" }
  }
}

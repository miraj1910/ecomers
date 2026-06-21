"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createOrderSchema } from "@/lib/validations/order"
import { CACHE_TAGS } from "@/lib/cache"
import type { OrderWithItems, ServerActionResult } from "@/types/prisma"

export async function createOrder(input: unknown): Promise<ServerActionResult<OrderWithItems>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const parsed = createOrderSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        stripeSessionId: parsed.data.stripeSessionId ?? null,
        paymentIntentId: parsed.data.paymentIntentId ?? null,
        totalAmount: parsed.data.totalAmount,
        shippingName: parsed.data.shippingName ?? "",
        shippingStreet: parsed.data.shippingStreet ?? "",
        shippingCity: parsed.data.shippingCity ?? "",
        shippingState: parsed.data.shippingState ?? "",
        shippingPostal: parsed.data.shippingPostal ?? "",
        items: {
          create: parsed.data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            image: item.image ?? null,
          })),
        },
      },
      include: { items: true },
    })

    revalidatePath("/orders")
    revalidateTag(CACHE_TAGS.orders, 'max')
    revalidateTag(CACHE_TAGS.inventory, 'max')

    return {
      success: true,
      data: {
        id: order.id,
        userId: order.userId,
        stripeSessionId: order.stripeSessionId,
        paymentIntentId: order.paymentIntentId,
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          size: item.size,
          image: item.image,
        })),
      },
    }
  } catch (error) {
    console.error("Create order error:", error)
    return { success: false, error: "Failed to create order" }
  }
}

export async function getUserOrders(): Promise<ServerActionResult<OrderWithItems[]>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        stripeSessionId: order.stripeSessionId,
        paymentIntentId: order.paymentIntentId,
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          size: item.size,
          image: item.image,
        })),
      })),
    }
  } catch (error) {
    console.error("Fetch orders error:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { cookies } from "next/headers"
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email/triggers"
import { CACHE_TAGS } from "@/lib/cache"
import { OrderStatusEnum, RoleEnum } from "@/lib/validations/admin"

const ADMIN_COOKIE_NAME = "admin_token"
const ADMIN_COOKIE_VALUE = "verified"

async function requireAdmin() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  if (adminCookie?.value === ADMIN_COOKIE_VALUE) {
    return null
  }

  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")
  return session
}

export async function getDashboardStats() {
  await requireAdmin()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [revenueAgg, totalOrders, totalUsers, totalProducts, lowStockCount, recentOrders, revenueByDay] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.productInventory
        .findMany({ select: { stock: true, lowStockThreshold: true } })
        .then((items) => items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold).length),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { createdAt: "asc" },
      }),
    ])

  const revenueByDayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    revenueByDayMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 })
  }
  for (const entry of revenueByDay) {
    const key = entry.createdAt.toISOString().slice(0, 10)
    const existing = revenueByDayMap.get(key)
    if (existing) {
      existing.revenue += Number(entry._sum.totalAmount ?? 0)
      existing.orders += entry._count
    }
  }

  const chartData = Array.from(revenueByDayMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }))

  const topProducts = await prisma.orderItem.groupBy({
    by: ["name", "productId"],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  })

  return {
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    totalOrders,
    totalUsers,
    totalProducts,
    lowStockCount,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
      user: o.user,
      itemCount: o.items.length,
    })),
    revenueChart: chartData,
    topProducts: topProducts.map((p) => ({
      name: p.name,
      productId: p.productId,
      totalSold: Number(p._sum.quantity ?? 0),
      totalRevenue: Number(p._sum.price ?? 0),
    })),
  }
}

export async function getOrdersPage(page: number = 1, pageSize: number = 20, search?: string, status?: string) {
  await requireAdmin()

  const where: Record<string, unknown> = {}

  if (status && status !== "ALL") {
    const parsed = OrderStatusEnum.safeParse(status)
    if (!parsed.success) throw new Error(`Invalid order status filter: ${status}`)
    where.orderStatus = parsed.data
  }

  if (search) {
    where.OR = [
      { id: { contains: search } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders: orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      user: o.user,
      itemCount: o.items.length,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function updateOrderStatus(orderId: string, orderStatus: string) {
  await requireAdmin()

  const parsed = OrderStatusEnum.safeParse(orderStatus)
  if (!parsed.success) throw new Error(`Invalid order status: ${orderStatus}`)

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: parsed.data },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidateTag(CACHE_TAGS.orders, 'max')

  // Send email notifications for status changes
  if (orderStatus === "SHIPPED" || orderStatus === "DELIVERED") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (order) {
      const emailData = {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
        shippingStreet: order.shippingStreet,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostal: order.shippingPostal,
        shippingCountry: order.shippingCountry,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          size: item.size,
          image: item.image,
        })),
      }

      if (orderStatus === "SHIPPED") {
        sendOrderShippedEmail(emailData).catch((err) => {
          console.error(`[Admin] Failed to send shipped email for order ${orderId}:`, err)
        })
      } else {
        sendOrderDeliveredEmail(emailData).catch((err) => {
          console.error(`[Admin] Failed to send delivered email for order ${orderId}:`, err)
        })
      }
    }
  }
}

export async function getUsersPage(page: number = 1, pageSize: number = 20, search?: string) {
  await requireAdmin()

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, image: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map((u) => ({
      id: u.id, name: u.name, email: u.email, image: u.image,
      role: u.role, createdAt: u.createdAt, orderCount: u._count.orders,
    })),
    total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin()

  const parsed = RoleEnum.safeParse(role)
  if (!parsed.success) throw new Error(`Invalid role: ${role}`)

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data },
  })

  revalidatePath("/admin/users")
}

export async function getProductsPage(page: number = 1, pageSize: number = 20, search?: string) {
  await requireAdmin()

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { productId: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }

  const [products, total] = await Promise.all([
    prisma.productInventory.findMany({
      where,
      orderBy: { productId: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.productInventory.count({ where }),
  ])

  return {
    products: products.map((p) => ({
      id: p.id, productId: p.productId, stock: p.stock, sku: p.sku,
      reservedStock: p.reservedStock, availableStock: p.stock - p.reservedStock,
    })),
    total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function updateProductStock(productId: string, stock: number) {
  await requireAdmin()

  await prisma.productInventory.update({
    where: { productId },
    data: { stock },
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.inventory, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
}

export async function bulkUpdateOrdersStatus(ids: string[], orderStatus: string) {
  await requireAdmin()

  const parsed = OrderStatusEnum.safeParse(orderStatus)
  if (!parsed.success) throw new Error(`Invalid order status: ${orderStatus}`)

  await prisma.order.updateMany({
    where: { id: { in: ids } },
    data: { orderStatus: parsed.data },
  })

  revalidatePath("/admin/orders")
  revalidateTag(CACHE_TAGS.orders, 'max')
}

export async function bulkUpdateUsersRole(ids: string[], role: string) {
  await requireAdmin()

  const parsed = RoleEnum.safeParse(role)
  if (!parsed.success) throw new Error(`Invalid role: ${role}`)

  await prisma.user.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { role: parsed.data },
  })

  revalidatePath("/admin/users")
}

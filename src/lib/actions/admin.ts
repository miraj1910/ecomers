"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/middleware-helpers"
import { z } from "zod"
import { CACHE_TAGS } from "@/lib/cache"
import { createProductSchema, updateProductSchema, productQuerySchema } from "@/lib/validations/product"
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations/product"
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email/triggers"

export async function getAdminProducts(input: {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  categoryId?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}) {
  await requireAdmin()

  const parsed = productQuerySchema.parse(input)

  const where: Record<string, unknown> = { deletedAt: null }

  if (parsed.search) {
    where.OR = [
      { name: { contains: parsed.search, mode: "insensitive" } },
      { sku: { contains: parsed.search, mode: "insensitive" } },
      { slug: { contains: parsed.search, mode: "insensitive" } },
    ]
  }

  if (parsed.category) {
    where.category = parsed.category
  }

  if (parsed.categoryId) {
    where.categoryId = parsed.categoryId
  }

  if (parsed.status) {
    where.status = parsed.status
  }

  const orderBy: Record<string, string> = {
    [parsed.sortBy]: parsed.sortOrder,
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
    }),
    prisma.product.count({ where }),
  ])

  const [stringCategories, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      categoryId: p.categoryId,
      categoryName: dbCategories.find((c) => c.id === p.categoryId)?.name ?? null,
      brand: p.brand,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      stock: p.stock,
      sku: p.sku,
      images: p.images,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    total,
    page: parsed.page,
    pageSize: parsed.pageSize,
    totalPages: Math.ceil(total / parsed.pageSize),
    categories: stringCategories.map((c) => c.category).filter(Boolean) as string[],
    dbCategories: dbCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  }
}

export async function getAdminProduct(id: string) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    category: product.category ?? "",
    categoryId: product.categoryId,
    brand: product.brand ?? "",
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    stock: product.stock,
    sku: product.sku,
    images: product.images,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function createProduct(input: CreateProductInput) {
  await requireAdmin()

  const parsed = createProductSchema.parse(input)

  const existingSlug = await prisma.product.findUnique({
    where: { slug: parsed.slug },
  })
  if (existingSlug) {
    throw new Error("A product with this slug already exists")
  }

  const existingSku = await prisma.product.findUnique({
    where: { sku: parsed.sku },
  })
  if (existingSku) {
    throw new Error("A product with this SKU already exists")
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description ?? "",
      category: parsed.category ?? "",
      categoryId: parsed.categoryId ?? null,
      brand: parsed.brand ?? "",
      price: parsed.price,
      discountPrice: parsed.discountPrice ?? null,
      stock: parsed.stock,
      sku: parsed.sku,
      images: parsed.images,
      status: parsed.status,
    },
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
  return { id: product.id }
}

export async function updateProduct(input: UpdateProductInput) {
  await requireAdmin()

  let parsed
  try {
    parsed = updateProductSchema.parse(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message} (received: ${JSON.stringify(issue.input)})`
      )
      throw new Error(`Validation failed:\n${details.join("\n")}`)
    }
    throw error
  }

  const existing = await prisma.product.findUnique({
    where: { id: parsed.id, deletedAt: null },
  })
  if (!existing) {
    throw new Error("Product not found")
  }

  if (parsed.slug && parsed.slug !== existing.slug) {
    const slugExists = await prisma.product.findUnique({
      where: { slug: parsed.slug },
    })
    if (slugExists) {
      throw new Error("A product with this slug already exists")
    }
  }

  if (parsed.sku && parsed.sku !== existing.sku) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: parsed.sku },
    })
    if (skuExists) {
      throw new Error("A product with this SKU already exists")
    }
  }

  const data: Record<string, unknown> = {}
  if (parsed.name !== undefined) data.name = parsed.name
  if (parsed.slug !== undefined) data.slug = parsed.slug
  if (parsed.description !== undefined) data.description = parsed.description
  if (parsed.category !== undefined) data.category = parsed.category
  if (parsed.categoryId !== undefined) data.categoryId = parsed.categoryId ?? null
  if (parsed.brand !== undefined) data.brand = parsed.brand
  if (parsed.price !== undefined) data.price = parsed.price
  if (parsed.discountPrice !== undefined) data.discountPrice = parsed.discountPrice
  if (parsed.stock !== undefined) data.stock = parsed.stock
  if (parsed.sku !== undefined) data.sku = parsed.sku
  if (parsed.images !== undefined) data.images = parsed.images
  if (parsed.status !== undefined) data.status = parsed.status

  await prisma.product.update({
    where: { id: parsed.id },
    data,
  })

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${parsed.id}`)
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  const existing = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  })
  if (!existing) {
    throw new Error("Product not found")
  }

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}

export async function getAdminUsers(input: {
  page?: number
  pageSize?: number
  search?: string
}) {
  await requireAdmin()

  const page = input.page ?? 1
  const pageSize = input.pageSize ?? 20
  const search = input.search

  const where: Record<string, unknown> = { deletedAt: null }

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
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
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
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BLOCKED") {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  })

  revalidatePath("/admin/users")
}

export async function updateUserRole(userId: string, role: "CUSTOMER" | "ADMIN") {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath("/admin/users")
}

export async function softDeleteUser(userId: string) {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  })

  revalidatePath("/admin/users")
}

export async function getAdminOrders(input: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}) {
  await requireAdmin()

  const page = input.page ?? 1
  const pageSize = input.pageSize ?? 20
  const search = input.search
  const status = input.status

  const where: Record<string, unknown> = {}

  if (status && status !== "ALL") {
    where.orderStatus = status
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
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
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
      items: o.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size,
        image: item.image,
      })),
      itemCount: o.items.length,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

const VALID_ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const
type OrderStatus = (typeof VALID_ORDER_STATUSES)[number]

export async function updateOrderStatus(orderId: string, orderStatus: string) {
  await requireAdmin()

  if (!VALID_ORDER_STATUSES.includes(orderStatus as OrderStatus)) {
    throw new Error(`Invalid order status: ${orderStatus}`)
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: orderStatus as OrderStatus },
  })

  revalidatePath("/admin/orders")
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

export async function updateBulkStock(
  items: { productId: string; stock: number }[]
) {
  await requireAdmin()

  await prisma.$transaction(
    items.map((item) =>
      prisma.productInventory.update({
        where: { productId: item.productId },
        data: { stock: item.stock },
      })
    )
  )

  revalidatePath("/admin/inventory")
  revalidateTag(CACHE_TAGS.inventory, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
}

export async function bulkDeleteProducts(ids: string[]) {
  await requireAdmin()

  await prisma.product.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() },
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}

export async function bulkUpdateProducts(
  ids: string[],
  data: { status?: "ACTIVE" | "INACTIVE"; categoryId?: string | null; category?: string }
) {
  await requireAdmin()

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null
  if (data.category !== undefined) updateData.category = data.category

  await prisma.product.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: updateData,
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}

export async function bulkPublishProducts(ids: string[], status: "ACTIVE" | "INACTIVE") {
  await requireAdmin()

  await prisma.product.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { status },
  })

  revalidatePath("/admin/products")
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}

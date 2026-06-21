"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CACHE_TAGS } from "@/lib/cache"
import type { InventoryItem, InventoryPageData, InventoryUpdateInput, AddInventoryInput, StockValidationResult, StockStatus, ServerActionResult } from "@/types/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function getInventoryPage(page: number = 1, pageSize: number = 20, search?: string): Promise<InventoryPageData> {
  await requireAdmin()

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { productId: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.productInventory.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.productInventory.count({ where }),
  ])

  return {
    items: items.map((i) => ({
      id: i.id, productId: i.productId, sku: i.sku, stock: i.stock,
      reservedStock: i.reservedStock, lowStockThreshold: i.lowStockThreshold,
      availableStock: i.stock - i.reservedStock, updatedAt: i.updatedAt,
    })),
    total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

import { updateInventorySchema, addInventoryItemSchema } from "@/lib/validations/admin"

export async function updateInventoryItem(input: InventoryUpdateInput): Promise<ServerActionResult<InventoryItem>> {
  try {
    await requireAdmin()

    const parsed = updateInventorySchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const existing = await prisma.productInventory.findUnique({
      where: { productId: parsed.data.productId },
    })

    if (!existing) {
      return { success: false, error: "Product not found in inventory" }
    }

    const data: Record<string, unknown> = { stock: parsed.data.stock }
    if (parsed.data.sku !== undefined) data.sku = parsed.data.sku
    if (parsed.data.lowStockThreshold !== undefined) data.lowStockThreshold = parsed.data.lowStockThreshold

    const updated = await prisma.productInventory.update({
      where: { productId: parsed.data.productId },
      data,
    })

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidateTag(CACHE_TAGS.inventory, 'max')
    revalidateTag(CACHE_TAGS.products, 'max')

    return {
      success: true,
      data: {
        id: updated.id, productId: updated.productId, sku: updated.sku,
        stock: updated.stock, reservedStock: updated.reservedStock,
        lowStockThreshold: updated.lowStockThreshold,
        availableStock: updated.stock - updated.reservedStock, updatedAt: updated.updatedAt,
      },
    }
  } catch (error) {
    console.error("Update inventory error:", error)
    return { success: false, error: "Failed to update inventory" }
  }
}

export async function addInventoryItem(input: AddInventoryInput): Promise<ServerActionResult<InventoryItem>> {
  try {
    await requireAdmin()

    const parsed = addInventoryItemSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parsed.data.productId, deletedAt: null },
    })
    if (!existingProduct) {
      return { success: false, error: "Product not found" }
    }

    const existingInventory = await prisma.productInventory.findUnique({
      where: { productId: parsed.data.productId },
    })
    if (existingInventory) {
      return { success: false, error: "Inventory item already exists for this product" }
    }

    const existingSku = await prisma.productInventory.findUnique({
      where: { sku: parsed.data.sku },
    })
    if (existingSku) {
      return { success: false, error: "A inventory item with this SKU already exists" }
    }

    const item = await prisma.productInventory.create({
      data: {
        productId: parsed.data.productId,
        stock: parsed.data.stock,
        sku: parsed.data.sku,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
    })

    revalidatePath("/admin/inventory")

    return {
      success: true,
      data: {
        id: item.id, productId: item.productId, sku: item.sku,
        stock: item.stock, reservedStock: item.reservedStock,
        lowStockThreshold: item.lowStockThreshold,
        availableStock: item.stock - item.reservedStock, updatedAt: item.updatedAt,
      },
    }
  } catch (error) {
    console.error("Add inventory error:", error)
    return { success: false, error: "Failed to add inventory item" }
  }
}

export async function deleteInventoryItem(productId: string): Promise<ServerActionResult> {
  try {
    await requireAdmin()

    const existing = await prisma.productInventory.findUnique({
      where: { productId },
    })
    if (!existing) {
      return { success: false, error: "Inventory item not found" }
    }

    await prisma.productInventory.delete({
      where: { productId },
    })

    revalidatePath("/admin/inventory")
    revalidateTag(CACHE_TAGS.inventory, 'max')
    revalidateTag(CACHE_TAGS.products, 'max')

    return { success: true }
  } catch (error) {
    console.error("Delete inventory error:", error)
    return { success: false, error: "Failed to delete inventory item" }
  }
}

export async function getStockStatus(productId: string): Promise<ServerActionResult<{ stock: number; status: StockStatus; available: number }>> {
  try {
    const inventory = await prisma.productInventory.findUnique({ where: { productId } })
    if (!inventory) return { success: false, error: "Product not found in inventory" }

    const available = inventory.stock - inventory.reservedStock
    let status: StockStatus

    if (inventory.stock <= 0) status = "out-of-stock"
    else if (available <= 0) status = "out-of-stock"
    else if (available <= inventory.lowStockThreshold) status = "low-stock"
    else status = "in-stock"

    return { success: true, data: { stock: inventory.stock, status, available } }
  } catch (error) {
    console.error("Get stock status error:", error)
    return { success: false, error: "Failed to fetch stock status" }
  }
}

export async function validateStock(items: { productId: string; quantity: number }[]): Promise<StockValidationResult> {
  const insufficientItems: StockValidationResult["insufficientItems"] = []

  for (const item of items) {
    const inventory = await prisma.productInventory.findUnique({ where: { productId: item.productId } })

    if (!inventory) {
      insufficientItems.push({ productId: item.productId, name: item.productId, requested: item.quantity, available: 0 })
      continue
    }

    const available = inventory.stock - inventory.reservedStock
    if (available < item.quantity) {
      insufficientItems.push({ productId: item.productId, name: item.productId, requested: item.quantity, available: Math.max(0, available) })
    }
  }

  return { valid: insufficientItems.length === 0, insufficientItems }
}

export async function reserveStock(productId: string, quantity: number): Promise<ServerActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.productInventory.findUnique({ where: { productId } })
      if (!inventory) throw new Error("Product not found in inventory")

      const available = inventory.stock - inventory.reservedStock
      if (available < quantity) {
        throw new Error(`Insufficient stock. Available: ${available}, requested: ${quantity}`)
      }

      await tx.productInventory.update({
        where: { productId },
        data: { reservedStock: { increment: quantity } },
      })

      return { success: true as const }
    })

    return result
  } catch (error) {
    console.error("Reserve stock error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to reserve stock" }
  }
}

export async function reduceStockAfterPayment(items: { productId: string; quantity: number }[]): Promise<ServerActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const inventory = await tx.productInventory.findUnique({ where: { productId: item.productId } })

        if (!inventory) {
          console.warn(`[Inventory] No inventory record for ${item.productId}, skipping`)
          continue
        }

        const newStock = inventory.stock - item.quantity
        if (newStock < 0) {
          console.warn(`[Inventory] Stock would go negative for ${item.productId}: current=${inventory.stock}, deducting=${item.quantity}. Clamping to 0.`)
        }

        const reservedDeduction = Math.min(item.quantity, inventory.reservedStock)

        await tx.productInventory.update({
          where: { productId: item.productId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { decrement: reservedDeduction },
          },
        })
      }
    })

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidateTag(CACHE_TAGS.inventory, 'max')
    revalidateTag(CACHE_TAGS.products, 'max')

    return { success: true }
  } catch (error) {
    console.error("Reduce stock error:", error)
    return { success: false, error: "Failed to reduce stock" }
  }
}

export async function getLowStockItems(): Promise<ServerActionResult<InventoryItem[]>> {
  try {
    const items = await prisma.productInventory.findMany({ orderBy: { stock: "asc" } })
    const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold)

    return {
      success: true,
      data: lowStock.map((i) => ({
        id: i.id, productId: i.productId, sku: i.sku, stock: i.stock,
        reservedStock: i.reservedStock, lowStockThreshold: i.lowStockThreshold,
        availableStock: i.stock - i.reservedStock, updatedAt: i.updatedAt,
      })),
    }
  } catch (error) {
    console.error("Get low stock items error:", error)
    return { success: false, error: "Failed to fetch low stock items" }
  }
}

export async function getOutOfStockItems(): Promise<ServerActionResult<InventoryItem[]>> {
  try {
    const items = await prisma.productInventory.findMany({
      where: { stock: { lte: 0 } },
      orderBy: { stock: "asc" },
    })

    const outOfStock = items.filter((i) => i.stock - i.reservedStock <= 0)

    return {
      success: true,
      data: outOfStock.map((i) => ({
        id: i.id, productId: i.productId, sku: i.sku, stock: i.stock,
        reservedStock: i.reservedStock, lowStockThreshold: i.lowStockThreshold,
        availableStock: i.stock - i.reservedStock, updatedAt: i.updatedAt,
      })),
    }
  } catch (error) {
    console.error("Get out of stock items error:", error)
    return { success: false, error: "Failed to fetch out of stock items" }
  }
}

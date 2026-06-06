import { z } from "zod"
import { id, paginatedQuery } from "./common"

export const OrderStatusEnum = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
export const RoleEnum = z.enum(["CUSTOMER", "ADMIN"])
export const PaymentStatusEnum = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"])

export const updateOrderStatusSchema = z.object({
  orderId: id,
  orderStatus: OrderStatusEnum,
})

export const updateUserRoleSchema = z.object({
  userId: id,
  role: RoleEnum,
})

export const updateProductStockSchema = z.object({
  productId: id,
  stock: z.number().int().min(0, "Stock cannot be negative"),
})

export const updateInventorySchema = z.object({
  productId: id,
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().max(100).optional(),
  lowStockThreshold: z.number().int().min(0, "Threshold cannot be negative").optional(),
})

export const addInventoryItemSchema = z.object({
  productId: id,
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().min(1, "SKU is required").max(100),
  lowStockThreshold: z.number().int().min(0, "Threshold cannot be negative").default(5),
})

export const adminQuerySchema = paginatedQuery

export const orderStatusFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  status: OrderStatusEnum.optional(),
  search: z.string().max(200).optional(),
})

import { z } from "zod"
import { id, price } from "./common"

export const orderItemSchema = z.object({
  productId: id,
  name: z.string().min(1, "Name is required").max(255),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price,
  size: z.string().max(50).optional(),
  image: z.string().url().optional().nullable(),
})

export const createOrderSchema = z.object({
  stripeSessionId: z.string().max(255).optional(),
  paymentIntentId: z.string().max(255).optional(),
  totalAmount: price,
  shippingName: z.string().optional(),
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostal: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

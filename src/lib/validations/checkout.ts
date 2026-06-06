import { z } from "zod"

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  size: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
})

export const checkoutSessionSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
})

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>

import { z } from "zod"

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  size: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
})

export const shippingInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
})

export const checkoutSessionSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
  shipping: shippingInfoSchema,
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).optional().default(0),
})

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>

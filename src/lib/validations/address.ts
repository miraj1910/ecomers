import { z } from "zod"

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Valid email is required").max(255),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(20, "Phone number too long")
    .regex(/^[+\d][\d\s\-().]*$/, "Invalid phone number format"),
  addressLine1: z.string().min(1, "Address is required").max(500),
  addressLine2: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(200),
  state: z.string().min(1, "State is required").max(200),
  country: z.string().min(1, "Country is required").max(200),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20)
    .regex(/^[\d\s\-a-zA-Z]+$/, "Invalid postal code format"),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  street: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(200),
  state: z.string().min(1, "State is required").max(200),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20)
    .regex(/^[\d\s\-a-zA-Z]+$/, "Invalid postal code format"),
  country: z.string().min(1, "Country is required").max(200).default("US"),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d][\d\s\-().]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
})

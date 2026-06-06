import { z } from "zod"

const requiredField = (max: number) => z.string().min(1).max(max)
const optionalField = (max: number) => z.string().max(max).optional()

export const addressSchema = z.object({
  fullName: requiredField(100),
  street: optionalField(200),
  city: requiredField(100),
  state: requiredField(100),
  postalCode: requiredField(20),
  country: z.string().max(100).default("US"),
  phone: optionalField(20),
  isDefault: z.boolean().default(false),
})

export type AddressFormData = z.infer<typeof addressSchema>

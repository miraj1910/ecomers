import { z } from "zod"

export const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Value must be positive").max(999999.99),
  active: z.boolean().optional().default(true),
  usageLimit: z.number().int().min(0).optional().default(0),
  usedCount: z.number().int().min(0).optional().default(0),
  minAmount: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  subtotal: z.number().min(0, "Subtotal is required"),
})

export type CouponInput = z.infer<typeof couponSchema>

import { z } from "zod"

export const ProductStatusEnum = z.enum(["ACTIVE", "INACTIVE"])

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).optional().default(""),
  category: z.string().max(200).optional().default(""),
  categoryId: z.string().max(100).optional().nullable().default(null),
  brand: z.string().max(200).optional().default(""),
  price: z.coerce.number().min(0, "Price must be non-negative").max(999999.99),
  discountPrice: z.coerce
    .number()
    .min(0)
    .max(999999.99)
    .optional()
    .nullable()
    .default(null),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative").default(0),
  sku: z.string().min(1, "SKU is required").max(100),
  images: z.array(z.string().max(1000)).default([]),
  status: ProductStatusEnum.default("ACTIVE"),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1),
})

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  categoryId: z.string().max(100).optional(),
  status: ProductStatusEnum.optional(),
  sortBy: z
    .enum(["name", "price", "stock", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

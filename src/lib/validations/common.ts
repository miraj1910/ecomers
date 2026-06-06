import { z } from "zod"

export const id = z.string().min(1, "ID is required")

export const page = z.coerce.number().int().min(1).default(1)

export const pageSize = z.coerce.number().int().min(1).max(100).default(20)

export const search = z.string().max(200).optional()

export const sanitizedString = (maxLength: number) =>
  z.string().max(maxLength, `Must be at most ${maxLength} characters`)

export const trimmedString = (maxLength: number) =>
  z.string().max(maxLength).transform((s) => s.trim())

export const pagination = z.object({
  page,
  pageSize,
})

export const paginatedQuery = z.object({
  page: page.optional(),
  pageSize: pageSize.optional(),
  search: search.optional(),
})

export const Rating = z.coerce.number().int().min(1).max(5)

export const Email = z.string().email().max(255)

export const price = z.coerce.number().min(0).max(999999.99)

import { z } from "zod"
import { id, Rating } from "./common"

export const createReviewSchema = z.object({
  productId: id,
  rating: Rating,
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
})

export const updateReviewSchema = z.object({
  rating: Rating.optional(),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

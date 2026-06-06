import { z } from "zod"

export const UserStatusEnum = z.enum(["ACTIVE", "BLOCKED"])

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: UserStatusEnum,
})

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CUSTOMER", "ADMIN"]),
})

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>

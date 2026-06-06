import { describe, it, expect } from "vitest"
import { checkoutSessionSchema } from "@/lib/validations/checkout"
import { updateOrderStatusSchema, updateUserRoleSchema, updateInventorySchema } from "@/lib/validations/admin"
import { createReviewSchema, updateReviewSchema } from "@/lib/validations/reviews"
import { addressSchema } from "@/lib/validations/address"
import { createOrderSchema } from "@/lib/validations/order"

describe("checkout session schema", () => {
  it("accepts valid items", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: 29.99, quantity: 2 }],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty items", () => {
    const result = checkoutSessionSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })

  it("rejects missing items", () => {
    const result = checkoutSessionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects negative price", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: -5, quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects zero quantity", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: 10, quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })
})

describe("order status update schema", () => {
  it("accepts valid statuses", () => {
    for (const s of ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]) {
      expect(updateOrderStatusSchema.safeParse({ orderId: "abc", orderStatus: s }).success).toBe(true)
    }
  })

  it("rejects invalid status", () => {
    const result = updateOrderStatusSchema.safeParse({ orderId: "abc", orderStatus: "INVALID" })
    expect(result.success).toBe(false)
  })

  it("rejects missing orderId", () => {
    const result = updateOrderStatusSchema.safeParse({ orderStatus: "SHIPPED" })
    expect(result.success).toBe(false)
  })
})

describe("user role update schema", () => {
  it("accepts valid roles", () => {
    expect(updateUserRoleSchema.safeParse({ userId: "abc", role: "ADMIN" }).success).toBe(true)
    expect(updateUserRoleSchema.safeParse({ userId: "abc", role: "CUSTOMER" }).success).toBe(true)
  })

  it("rejects invalid role", () => {
    const result = updateUserRoleSchema.safeParse({ userId: "abc", role: "SUPERADMIN" })
    expect(result.success).toBe(false)
  })
})

describe("inventory update schema", () => {
  it("accepts valid inventory input", () => {
    const result = updateInventorySchema.safeParse({ productId: "p1", stock: 10, sku: "SKU-001" })
    expect(result.success).toBe(true)
  })

  it("rejects negative stock", () => {
    const result = updateInventorySchema.safeParse({ productId: "p1", stock: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects negative threshold", () => {
    const result = updateInventorySchema.safeParse({ productId: "p1", stock: 10, lowStockThreshold: -1 })
    expect(result.success).toBe(false)
  })

  it("accepts partial update", () => {
    const result = updateInventorySchema.safeParse({ productId: "p1", stock: 5 })
    expect(result.success).toBe(true)
  })
})

describe("review schemas", () => {
  it("accepts valid create review", () => {
    const result = createReviewSchema.safeParse({ productId: "p1", rating: 4, title: "Great", comment: "Loved it" })
    expect(result.success).toBe(true)
  })

  it("rejects rating out of range", () => {
    expect(createReviewSchema.safeParse({ productId: "p1", rating: 0 }).success).toBe(false)
    expect(createReviewSchema.safeParse({ productId: "p1", rating: 6 }).success).toBe(false)
  })

  it("accepts review with only rating", () => {
    const result = createReviewSchema.safeParse({ productId: "p1", rating: 3 })
    expect(result.success).toBe(true)
  })

  it("accepts valid update review", () => {
    const result = updateReviewSchema.safeParse({ rating: 5, title: "Updated", comment: null })
    expect(result.success).toBe(true)
  })

  it("accepts empty update", () => {
    const result = updateReviewSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe("address schema", () => {
  it("accepts valid address", () => {
    const result = addressSchema.safeParse({
      fullName: "John Doe",
      city: "New York",
      state: "NY",
      postalCode: "10001",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing required fields", () => {
    const result = addressSchema.safeParse({ fullName: "John" })
    expect(result.success).toBe(false)
  })

  it("applies default country", () => {
    const result = addressSchema.safeParse({
      fullName: "John", city: "NY", state: "NY", postalCode: "10001",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.country).toBe("US")
  })
})

describe("create order schema", () => {
  it("accepts valid order input", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 59.98,
      items: [{ productId: "p1", name: "Shoes", quantity: 1, price: 59.98 }],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty items", () => {
    const result = createOrderSchema.safeParse({ totalAmount: 0, items: [] })
    expect(result.success).toBe(false)
  })
})

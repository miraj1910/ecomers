import { describe, it, expect } from "vitest"
import { checkoutSessionSchema } from "@/lib/validations/checkout"
import { addressSchema } from "@/lib/validations/address"
import { createOrderSchema } from "@/lib/validations/order"

describe("Checkout Validation", () => {
  const validShipping = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    addressLine1: "123 Main St",
    city: "New York",
    state: "NY",
    country: "US",
    postalCode: "10001",
  }

  it("validates complete checkout session", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [
        { productId: "p1", name: "T-shirt", price: 29.99, quantity: 2 },
        { productId: "p2", name: "Jeans", price: 59.99, quantity: 1 },
      ],
      shipping: validShipping,
      couponCode: "SAVE10",
    })
    expect(result.success).toBe(true)
  })

  it("validates checkout with discount", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: 29.99, quantity: 2 }],
      shipping: validShipping,
      couponCode: "PERCENT20",
      discountAmount: 12.0,
    })
    expect(result.success).toBe(true)
  })

  it("rejects items with missing required fields", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
      shipping: validShipping,
    })
    expect(result.success).toBe(false)
  })

  it("rejects checkout with no shipping info", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: 10, quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects checkout with invalid email in shipping", () => {
    const result = checkoutSessionSchema.safeParse({
      items: [{ productId: "p1", name: "T-shirt", price: 10, quantity: 1 }],
      shipping: { ...validShipping, email: "not-an-email" },
    })
    expect(result.success).toBe(false)
  })
})

describe("Address Validation", () => {
  it("accepts valid address with all fields", () => {
    const result = addressSchema.safeParse({
      fullName: "John Doe",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US",
      phone: "+1234567890",
      isDefault: true,
    })
    expect(result.success).toBe(true)
  })

  it("accepts address with only required fields", () => {
    const result = addressSchema.safeParse({
      fullName: "John Doe",
      city: "New York",
      state: "NY",
      postalCode: "10001",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country).toBe("US")
    }
  })

  it("rejects address without fullName", () => {
    const result = addressSchema.safeParse({
      city: "New York",
      state: "NY",
      postalCode: "10001",
    })
    expect(result.success).toBe(false)
  })

  it("rejects address without city", () => {
    const result = addressSchema.safeParse({
      fullName: "John Doe",
      state: "NY",
      postalCode: "10001",
    })
    expect(result.success).toBe(false)
  })
})

describe("Order Creation Validation", () => {
  it("accepts order with multiple items", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 89.97,
      items: [
        { productId: "p1", name: "Item 1", price: 29.99, quantity: 2 },
        { productId: "p2", name: "Item 2", price: 29.99, quantity: 1 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("accepts order with single item", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 19.99,
      items: [{ productId: "p1", name: "Single Item", price: 19.99, quantity: 1 }],
    })
    expect(result.success).toBe(true)
  })

  it("rejects order with zero total", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 0,
      items: [{ productId: "p1", name: "Free Item", price: 0, quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects order with negative amount", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: -10,
      items: [{ productId: "p1", name: "Item", price: 10, quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects order with empty items array", () => {
    const result = createOrderSchema.safeParse({ totalAmount: 0, items: [] })
    expect(result.success).toBe(false)
  })
})

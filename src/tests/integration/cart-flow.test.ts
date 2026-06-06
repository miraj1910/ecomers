import { describe, it, expect, beforeEach } from "vitest"
import { useCart } from "@/store/cart"
import { createCartItem } from "../utils"

describe("Cart integration", () => {
  beforeEach(() => {
    useCart.getState().clearCart()
  })

  it("adds multiple items and calculates subtotal", () => {
    const item1 = createCartItem({ productId: "p1", price: 10, quantity: 2 })
    const item2 = createCartItem({ productId: "p2", price: 15, quantity: 3 })

    useCart.getState().addItem(item1)
    useCart.getState().addItem(item2)

    expect(useCart.getState().items).toHaveLength(2)
    expect(useCart.getState().subtotal()).toBe(65)
    expect(useCart.getState().itemCount()).toBe(5)
  })

  it("increments quantity for existing item up to stock limit", () => {
    useCart.getState().addItem(createCartItem({ productId: "p1", stock: 3, quantity: 1 }))
    useCart.getState().addItem(createCartItem({ productId: "p1", stock: 3 }))
    useCart.getState().addItem(createCartItem({ productId: "p1", stock: 3 }))

    expect(useCart.getState().items).toHaveLength(1)
    expect(useCart.getState().items[0].quantity).toBe(3)
    expect(useCart.getState().itemCount()).toBe(3)
  })

  it("removes item and recalculates", () => {
    useCart.getState().addItem(createCartItem({ productId: "p1", price: 10, quantity: 2 }))
    useCart.getState().addItem(createCartItem({ productId: "p2", price: 20, quantity: 1 }))

    useCart.getState().removeItem("p1")
    expect(useCart.getState().items).toHaveLength(1)
    expect(useCart.getState().subtotal()).toBe(20)
    expect(useCart.getState().itemCount()).toBe(1)
  })

  it("updates quantity and clamps to stock", () => {
    useCart.getState().addItem(createCartItem({ productId: "p1", price: 10, stock: 5 }))
    useCart.getState().updateQuantity("p1", 3)
    expect(useCart.getState().items[0].quantity).toBe(3)

    useCart.getState().updateQuantity("p1", 10)
    expect(useCart.getState().items[0].quantity).toBe(5)
  })

  it("clears all items", () => {
    useCart.getState().addItem(createCartItem({ productId: "p1" }))
    useCart.getState().addItem(createCartItem({ productId: "p2" }))
    expect(useCart.getState().items).toHaveLength(2)

    useCart.getState().clearCart()
    expect(useCart.getState().items).toHaveLength(0)
    expect(useCart.getState().subtotal()).toBe(0)
    expect(useCart.getState().itemCount()).toBe(0)
  })
})

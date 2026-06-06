import { describe, it, expect, beforeEach } from "vitest"
import { useCart } from "@/store/cart"
import type { CartItem } from "@/types"

const sampleItem: CartItem = {
  productId: "prod-1",
  name: "Test Product",
  price: 29.99,
  quantity: 1,
  image: "/test.jpg",
  stock: 10,
}

describe("Cart Store", () => {
  beforeEach(() => {
    useCart.getState().clearCart()
  })

  it("starts with empty cart", () => {
    expect(useCart.getState().items).toHaveLength(0)
  })

  it("adds item to cart", () => {
    useCart.getState().addItem(sampleItem)
    expect(useCart.getState().items).toHaveLength(1)
    expect(useCart.getState().items[0].productId).toBe("prod-1")
  })

  it("increments quantity when adding existing item", () => {
    useCart.getState().addItem(sampleItem)
    useCart.getState().addItem(sampleItem)
    expect(useCart.getState().items).toHaveLength(1)
    expect(useCart.getState().items[0].quantity).toBe(2)
  })

  it("respects stock limit when adding", () => {
    useCart.getState().addItem({ ...sampleItem, stock: 2 })
    useCart.getState().addItem({ ...sampleItem, stock: 2 })
    useCart.getState().addItem({ ...sampleItem, stock: 2 })
    expect(useCart.getState().items[0].quantity).toBe(2)
  })

  it("removes item from cart", () => {
    useCart.getState().addItem(sampleItem)
    useCart.getState().removeItem("prod-1")
    expect(useCart.getState().items).toHaveLength(0)
  })

  it("updates item quantity", () => {
    useCart.getState().addItem(sampleItem)
    useCart.getState().updateQuantity("prod-1", 5)
    expect(useCart.getState().items[0].quantity).toBe(5)
  })

  it("clamps quantity to stock", () => {
    useCart.getState().addItem({ ...sampleItem, stock: 3 })
    useCart.getState().updateQuantity("prod-1", 10)
    expect(useCart.getState().items[0].quantity).toBe(3)
  })

  it("calculates subtotal correctly", () => {
    useCart.getState().addItem({ ...sampleItem, price: 10, quantity: 1 })
    useCart.getState().addItem({ ...{ ...sampleItem, productId: "prod-2" }, price: 20, quantity: 2 })
    expect(useCart.getState().subtotal()).toBe(50)
  })

  it("calculates item count correctly", () => {
    useCart.getState().addItem({ ...sampleItem, quantity: 1 })
    useCart.getState().addItem({ ...{ ...sampleItem, productId: "prod-2" }, quantity: 3 })
    expect(useCart.getState().itemCount()).toBe(4)
  })

  it("clears cart", () => {
    useCart.getState().addItem(sampleItem)
    useCart.getState().addItem({ ...sampleItem, productId: "prod-2" })
    useCart.getState().clearCart()
    expect(useCart.getState().items).toHaveLength(0)
  })
})

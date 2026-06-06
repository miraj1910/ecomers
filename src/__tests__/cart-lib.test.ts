import { describe, it, expect } from "vitest"
import {
  calculateSubtotal,
  totalItems,
  clampQuantity,
  isOverstock,
  formatCartPrice,
} from "@/lib/cart"

describe("cart lib utilities", () => {
  describe("calculateSubtotal", () => {
    it("returns 0 for empty array", () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it("calculates sum of price * quantity", () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 15, quantity: 1 },
      ]
      expect(calculateSubtotal(items)).toBe(35)
    })
  })

  describe("totalItems", () => {
    it("returns 0 for empty array", () => {
      expect(totalItems([])).toBe(0)
    })

    it("sums quantities", () => {
      expect(totalItems([{ quantity: 2 }, { quantity: 3 }])).toBe(5)
    })
  })

  describe("clampQuantity", () => {
    it("returns desired within bounds", () => {
      expect(clampQuantity(5, 1, 10)).toBe(5)
    })

    it("clamps to minimum", () => {
      expect(clampQuantity(0, 1, 10)).toBe(1)
    })

    it("clamps to maximum when max is defined", () => {
      expect(clampQuantity(20, 1, 10)).toBe(10)
    })

    it("does not clamp when max is undefined", () => {
      expect(clampQuantity(20, 1, undefined)).toBe(20)
    })
  })

  describe("isOverstock", () => {
    it("returns false when no max stock", () => {
      expect(isOverstock(5, undefined)).toBe(false)
    })

    it("returns true when at max", () => {
      expect(isOverstock(10, 10)).toBe(true)
    })

    it("returns false when below max", () => {
      expect(isOverstock(5, 10)).toBe(false)
    })
  })

  describe("formatCartPrice", () => {
    it("formats price with 2 decimals", () => {
      expect(formatCartPrice(29.99)).toBe("$29.99")
    })

    it("formats whole number", () => {
      expect(formatCartPrice(10)).toBe("$10.00")
    })
  })
})

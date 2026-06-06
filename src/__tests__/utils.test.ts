import { describe, it, expect } from "vitest"
import { cn, formatPrice } from "@/lib/utils"

describe("cn (classnames utility)", () => {
  it("combines class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges Tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })
})

describe("formatPrice", () => {
  it("formats price with default USD", () => {
    const result = formatPrice(29.99)
    expect(result).toContain("$")
  })

  it("formats with custom currency", () => {
    const result = formatPrice(29.99, { currency: "EUR", notation: "standard" })
    expect(result).toContain("€")
  })
})

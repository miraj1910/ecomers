import { describe, it, expect, vi, beforeEach } from "vitest"
import { absoluteUrl } from "@/lib/utils"

describe("absoluteUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com")
  })

  it("prepends APP_URL to path", () => {
    expect(absoluteUrl("/blog")).toBe("https://example.com/blog")
  })

  it("handles paths with trailing slash", () => {
    expect(absoluteUrl("/products/")).toBe("https://example.com/products/")
  })

  it("falls back to localhost when APP_URL is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined)
    expect(absoluteUrl("/test")).toBe("http://localhost:3000/test")
  })
})

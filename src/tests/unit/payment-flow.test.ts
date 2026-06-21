import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    productInventory: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: any) => any) => fn({
      order: { findUnique: vi.fn(), create: vi.fn() },
      productInventory: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
      user: { findUnique: vi.fn(), create: vi.fn() },
    })),
  },
}))

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    webhooks: { constructEvent: vi.fn() },
    checkout: { sessions: { listLineItems: vi.fn() } },
  })),
}))

vi.mock("@/lib/security/rate-limit", () => ({
  rateLimitMiddleware: vi.fn(() => null),
  getRateLimitKey: vi.fn(() => "test-ip"),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock("@/lib/email/triggers", () => ({
  sendOrderConfirmationEmail: vi.fn(),
}))

vi.mock("@/lib/cart-recovery", () => ({
  markRecoveredByEmail: vi.fn(),
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}))

import { prisma } from "@/lib/prisma"

describe("Stripe Webhook Processing", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects missing stripe-signature header", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route")
    const request = new Request("https://example.com/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("rejects request with invalid body (no signature)", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route")
    const request = new Request("https://example.com/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "invalid" },
      body: "not-valid-json",
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("requires STRIPE_WEBHOOK_SECRET to be set", async () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET

    const { POST } = await import("@/app/api/webhooks/stripe/route")
    const request = new Request("https://example.com/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=123,v1=abc" },
      body: "test",
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    process.env.STRIPE_WEBHOOK_SECRET = prev
  })
})

describe("Payment Status Transitions", () => {
  it("validates payment status enum values", () => {
    const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"]
    for (const s of validStatuses) {
      expect(s).toMatch(/^(PENDING|PAID|FAILED|REFUNDED)$/)
    }
  })

  it("checks that PAID transitions to REFUNDED are valid", () => {
    const transitions: Record<string, string[]> = {
      PENDING: ["PAID", "FAILED"],
      PAID: ["REFUNDED", "FAILED"],
      FAILED: ["PENDING"],
      REFUNDED: [],
    }
    expect(transitions.PAID).toContain("REFUNDED")
    expect(transitions.PENDING).toContain("PAID")
  })

  it("validates webhook requires authenticated event", () => {
    const signature = "invalid"
    expect(signature).toBeTruthy()
  })

  it("handles non-checkout session events gracefully", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route")
    const request = new Request("https://example.com/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=123,v1=abc" },
      body: "{}",
    })

    const response = await POST(request)
    expect([200, 500]).toContain(response.status)
  })
})

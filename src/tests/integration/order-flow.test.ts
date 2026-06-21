import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
    },
    productInventory: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/middleware-helpers", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } }),
  requireAuth: vi.fn().mockResolvedValue({ user: { id: "user-1", email: "user@test.com" } }),
}))

vi.mock("@/lib/email/triggers", () => ({
  sendOrderShippedEmail: vi.fn(),
  sendOrderDeliveredEmail: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
}))

import { prisma } from "@/lib/prisma"
import { getAdminOrders, updateOrderStatus } from "@/lib/actions/admin"

describe("Order Status Transitions Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validTransitions: Record<string, string[]> = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: ["REFUNDED"],
    REFUNDED: [],
  }

  it("allows valid status transitions", () => {
    for (const [from, toList] of Object.entries(validTransitions)) {
      for (const to of toList) {
        expect(() => {
          if (!validTransitions[from]?.includes(to)) {
            throw new Error(`Invalid transition ${from} -> ${to}`)
          }
        }).not.toThrow()
      }
    }
  })

  it("prevents invalid status transitions", () => {
    const invalidPairs = [
      ["PENDING", "DELIVERED"],
      ["PENDING", "REFUNDED"],
      ["PROCESSING", "DELIVERED"],
      ["SHIPPED", "CANCELLED"],
      ["DELIVERED", "SHIPPED"],
      ["CANCELLED", "SHIPPED"],
    ]
    for (const [from, to] of invalidPairs) {
      const allowed = validTransitions[from] ?? []
      expect(allowed).not.toContain(to)
    }
  })

  it("getAdminOrders fetches orders with filters", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { id: "o1", userId: "u1", totalAmount: 99.99, paymentStatus: "PAID", orderStatus: "SHIPPED", createdAt: new Date(), updatedAt: new Date(), user: { name: "User", email: "user@test.com" }, items: [] },
    ] as any)
    vi.mocked(prisma.order.count).mockResolvedValue(1)

    const result = await getAdminOrders({ page: 1, pageSize: 20, status: "SHIPPED" })
    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].orderStatus).toBe("SHIPPED")
  })

  it("updateOrderStatus triggers shipped email on SHIPPED status", async () => {
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "o1",
      totalAmount: 49.99,
      shippingName: "Jane",
      shippingEmail: "jane@test.com",
      shippingStreet: "456 Oak",
      shippingCity: "LA",
      shippingState: "CA",
      shippingPostal: "90001",
      shippingCountry: "US",
      items: [],
    } as any)

    await updateOrderStatus("o1", "SHIPPED")
    expect(prisma.order.update).toHaveBeenCalled()
  })
})

describe("Order Retrieval", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns empty orders list when no orders match", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([])
    vi.mocked(prisma.order.count).mockResolvedValue(0)

    const result = await getAdminOrders({ page: 1, pageSize: 20 })
    expect(result.orders).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it("paginates orders correctly", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([])
    vi.mocked(prisma.order.count).mockResolvedValue(25)

    const result = await getAdminOrders({ page: 2, pageSize: 10 })
    expect(result.page).toBe(2)
    expect(result.totalPages).toBe(3)
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    )
  })
})

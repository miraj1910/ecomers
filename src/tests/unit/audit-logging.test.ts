import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAuditEvent, auditAction, formatAuditPrevious } from "@/lib/security/audit"

describe("Audit Logging", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("logs an audit event successfully", async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "log-1" } as any)

    await logAuditEvent({
      actorId: "admin-1",
      action: "UPDATE",
      entity: "PRODUCT",
      entityId: "p1",
      previous: { price: 10 },
      new: { price: 15 },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "admin-1",
        action: "UPDATE",
        entity: "PRODUCT",
        entityId: "p1",
        previous: { price: 10 },
        new: { price: 15 },
        ip: undefined,
      },
    })
  })

  it("handles missing actor gracefully", async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "log-2" } as any)

    await logAuditEvent({
      action: "CREATE",
      entity: "ORDER",
      entityId: "o1",
      new: { total: 50 },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "CREATE",
        entity: "ORDER",
        entityId: "o1",
      }),
    })
  })

  it("handles database errors without throwing", async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error("DB error"))

    await expect(
      logAuditEvent({
        action: "DELETE",
        entity: "USER",
        entityId: "u1",
      })
    ).resolves.not.toThrow()
  })

  it("auditAction wraps function and logs success", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin-1" } } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "log-3" } as any)

    const result = await auditAction("CREATE", "PRODUCT", async () => {
      return { id: "new-product" }
    })

    expect(result).toEqual({ id: "new-product" })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        action: "CREATE",
        entity: "PRODUCT",
        new: { id: "new-product" },
      }),
    })
  })

  it("auditAction logs even if wrapped function throws", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin-1" } } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "log-4" } as any)

    await expect(
      auditAction("UPDATE", "ORDER", async () => {
        throw new Error("Update failed")
      })
    ).rejects.toThrow("Update failed")

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        action: "UPDATE",
        entity: "ORDER",
        new: undefined,
      }),
    })
  })

  it("formatAuditPrevious extracts specified keys", () => {
    const obj = { id: "p1", name: "Test", price: 29.99, stock: 10, sku: "SKU" }
    const result = formatAuditPrevious(obj, ["name", "price"])
    expect(result).toEqual({ name: "Test", price: 29.99 })
  })
})

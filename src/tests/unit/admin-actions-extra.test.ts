import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    productInventory: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: any) => any) => {
      const tx = {
        productInventory: {
          findUnique: vi.fn(),
          update: vi.fn(),
          create: vi.fn(),
        },
        order: {
          findUnique: vi.fn(),
          create: vi.fn(),
        },
        user: { findUnique: vi.fn(), create: vi.fn() },
      }
      return fn(tx)
    }),
  },
}))

vi.mock("@/middleware-helpers", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock("@/lib/email/triggers", () => ({
  sendOrderShippedEmail: vi.fn(),
  sendOrderDeliveredEmail: vi.fn(),
}))

import { prisma } from "@/lib/prisma"
import {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  softDeleteUser,
  getAdminOrders,
  updateOrderStatus,
  updateBulkStock,
  bulkDeleteProducts,
  bulkUpdateProducts,
  bulkPublishProducts,
} from "@/lib/actions/admin"

describe("Admin Products Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getAdminProducts returns paginated products", async () => {
    const mockProducts = [
      { id: "p1", name: "Product 1", slug: "product-1", sku: "SKU-1", price: 29.99, status: "ACTIVE" },
      { id: "p2", name: "Product 2", slug: "product-2", sku: "SKU-2", price: 49.99, status: "ACTIVE" },
    ]
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)
    vi.mocked(prisma.product.count).mockResolvedValue(2)
    vi.mocked(prisma.product.findMany)
      .mockResolvedValueOnce(mockProducts as any)
      .mockResolvedValueOnce([{ category: "Clothing" }, { category: "Electronics" }] as any)
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any)

    const result = await getAdminProducts({ page: 1, pageSize: 20 })

    expect(result.products).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it("getAdminProduct returns single product", async () => {
    const mockProduct = { id: "p1", name: "Test", slug: "test", sku: "SKU", price: 10, status: "ACTIVE" }
    vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any)

    const result = await getAdminProduct("p1")
    expect(result.id).toBe("p1")
    expect(result.name).toBe("Test")
  })

  it("getAdminProduct throws on not found", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
    await expect(getAdminProduct("nonexistent")).rejects.toThrow("Product not found")
  })

  it("createProduct creates a product", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.product.create).mockResolvedValue({ id: "new-p1" } as any)

    const result = await createProduct({
      name: "New Product",
      slug: "new-product",
      price: 19.99,
      stock: 10,
      sku: "SKU-NEW",
      images: ["/img.jpg"],
      status: "ACTIVE",
      description: "",
      category: "",
      brand: "",
    })

    expect(result.id).toBe("new-p1")
  })

  it("createProduct rejects duplicate slug", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValueOnce({ id: "existing" } as any)
    await expect(
      createProduct({
        name: "New Product",
        slug: "existing-slug",
        price: 10,
        stock: 5,
        sku: "SKU-NEW",
        images: [],
        status: "ACTIVE",
      })
    ).rejects.toThrow("slug already exists")
  })

  it("createProduct rejects duplicate SKU", async () => {
    vi.mocked(prisma.product.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing" } as any)
    await expect(
      createProduct({
        name: "New Product",
        slug: "new-slug",
        price: 10,
        stock: 5,
        sku: "SKU-EXISTING",
        images: [],
        status: "ACTIVE",
      })
    ).rejects.toThrow("SKU already exists")
  })

  it("updateProduct updates a product", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1", slug: "old", sku: "OLD" } as any)

    await updateProduct({ id: "p1", name: "Updated", price: 15 })
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({ name: "Updated", price: 15 }),
      })
    )
  })

  it("updateProduct throws on not found", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
    await expect(updateProduct({ id: "nonexistent" })).rejects.toThrow("Product not found")
  })

  it("deleteProduct soft-deletes a product", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1" } as any)
    await deleteProduct("p1")
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    )
  })

  it("bulkDeleteProducts soft-deletes multiple products", async () => {
    await bulkDeleteProducts(["p1", "p2"])
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ["p1", "p2"] } }),
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    )
  })

  it("bulkUpdateProducts updates multiple products", async () => {
    await bulkUpdateProducts(["p1", "p2"], { status: "INACTIVE" })
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ["p1", "p2"] } }),
        data: expect.objectContaining({ status: "INACTIVE" }),
      })
    )
  })

  it("bulkPublishProducts sets status on multiple products", async () => {
    await bulkPublishProducts(["p1", "p2"], "INACTIVE")
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ["p1", "p2"] } }),
        data: expect.objectContaining({ status: "INACTIVE" }),
      })
    )
  })
})

describe("Admin Users Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getAdminUsers returns paginated users", async () => {
    const mockUsers = [
      { id: "u1", name: "User 1", email: "u1@test.com", role: "CUSTOMER", status: "ACTIVE", createdAt: new Date(), image: null, _count: { orders: 1 } },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any)
    vi.mocked(prisma.user.count).mockResolvedValue(1)

    const result = await getAdminUsers({ page: 1, pageSize: 20 })
    expect(result.users).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it("updateUserStatus updates user status", async () => {
    await updateUserStatus("u1", "BLOCKED")
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" }, data: { status: "BLOCKED" } })
    )
  })

  it("updateUserRole updates user role", async () => {
    await updateUserRole("u1", "ADMIN")
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" }, data: { role: "ADMIN" } })
    )
  })

  it("softDeleteUser soft-deletes a user", async () => {
    await softDeleteUser("u1")
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" }, data: { deletedAt: expect.any(Date) } })
    )
  })
})

describe("Admin Orders Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getAdminOrders returns paginated orders", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      {
        id: "o1",
        userId: "u1",
        totalAmount: 59.99,
        paymentStatus: "PAID",
        orderStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: "User", email: "user@test.com" },
        items: [{ id: "oi1", productId: "p1", name: "Item", quantity: 1, price: 59.99, size: null, image: null }],
      },
    ] as any)
    vi.mocked(prisma.order.count).mockResolvedValue(1)

    const result = await getAdminOrders({ page: 1, pageSize: 20 })
    expect(result.orders).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it("updateOrderStatus updates status and triggers email", async () => {
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "o1",
      totalAmount: 59.99,
      shippingName: "John",
      shippingEmail: "john@test.com",
      shippingStreet: "123 St",
      shippingCity: "NYC",
      shippingState: "NY",
      shippingPostal: "10001",
      shippingCountry: "US",
      items: [],
    } as any)

    await updateOrderStatus("o1", "SHIPPED")
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "o1" }, data: { orderStatus: "SHIPPED" } })
    )
  })

  it("updateOrderStatus rejects invalid status", async () => {
    await expect(updateOrderStatus("o1", "INVALID" as any)).rejects.toThrow("Invalid order status")
  })

  it("updateBulkStock updates inventory in transaction", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (tx: any) => tx)
    await updateBulkStock([{ productId: "p1", stock: 50 }, { productId: "p2", stock: 30 }])
    expect(prisma.productInventory.update).toHaveBeenCalledTimes(2)
  })
})

import type { Order } from "@prisma/client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { WaterDroplet } from "@/components/droplets"

type OrderSummary = Pick<Order, "id" | "totalAmount" | "orderStatus" | "createdAt"> & { itemCount: number }

export const dynamic = "force-dynamic"

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-text-secondary" },
  PROCESSING: { label: "Processing", color: "text-text-secondary" },
  SHIPPED: { label: "Shipped", color: "text-text-secondary" },
  DELIVERED: { label: "Delivered", color: "text-success" },
  CANCELLED: { label: "Cancelled", color: "text-error" },
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  let orders: OrderSummary[] = []
  try {
    const raw = await prisma.order.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        totalAmount: true,
        orderStatus: true,
        createdAt: true,
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    orders = raw.map(({ items, ...o }) => ({ ...o, itemCount: items.length }))
  } catch (error) {
    console.error("Failed to load orders:", error)
  }

  return (
    <Section>
      <Container>
        <div className="mb-12">
          <span className="meta">Account</span>
          <h1 className="heading-section mt-2 text-text-primary">Order History</h1>
          <p className="mt-2 text-sm text-text-secondary">View and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <WaterDroplet size="md" />
            <h2 className="heading-product mt-5 text-text-primary">No orders yet</h2>
            <p className="mt-2 text-sm text-text-secondary max-w-sm">
              When you place an order, it will appear here so you can track its status and review details.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-12 items-center justify-center bg-text-primary px-8 text-[0.7rem] font-medium tracking-[0.15em] uppercase text-white hover:bg-accent-hover transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.orderStatus] ?? statusConfig.PENDING
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border-b border-border-subtle py-5 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {order.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        &middot; {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${status.color}`}>
                        {status.label}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-text-secondary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Total</span>
                    <span className="text-sm font-medium text-text-primary">
                      ${Number(order.totalAmount).toFixed(0)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </Section>
  )
}

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { PackageOpen, ChevronRight } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const statusConfig: Record<string, { label: string; colors: string }> = {
  PENDING: {
    label: "Pending",
    colors: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  },
  PROCESSING: {
    label: "Processing",
    colors: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  SHIPPED: {
    label: "Shipped",
    colors: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  },
  DELIVERED: {
    label: "Delivered",
    colors: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  CANCELLED: {
    label: "Cancelled",
    colors: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  },
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">Order History</h1>
          <p className="mt-1 text-sm text-secondary">
            View and track your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-surface border border-border flex flex-col items-center justify-center rounded-3xl py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] mb-4">
              <PackageOpen className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-white">No orders yet</h2>
            <p className="mt-1 text-sm text-secondary max-w-sm">
              When you place an order, it will appear here so you can track
              its status and review details.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-purple transition-all hover:bg-white"
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
                  className="rounded-2xl border border-border bg-surface block rounded-2xl p-5 transition-colors hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 text-xs text-secondary">
                        {order.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        &middot; {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.colors}`}
                      >
                        {status.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-secondary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <span className="text-sm text-secondary">Total</span>
                    <span className="text-base font-semibold text-white">
                      ${Number(order.totalAmount).toFixed(2)}
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

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { ArrowLeft, CreditCard, Package, Truck } from "lucide-react"

export const dynamic = "force-dynamic"

const paymentLabel: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

const paymentColor: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  PAID: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  FAILED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
}

const orderLabel: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

const orderColor: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  PROCESSING: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
  DELIVERED: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Link
            href="/orders"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &middot; {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                <Package className="h-5 w-5 text-secondary" />
                Items
              </h2>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {item.image && (
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      {item.size && (
                        <p className="mt-0.5 text-sm text-secondary">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-secondary">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="flex-shrink-0 font-medium">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                <CreditCard className="h-5 w-5 text-secondary" />
                Payment
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-secondary">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        paymentColor[order.paymentStatus]
                      }`}
                    >
                      {paymentLabel[order.paymentStatus]}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-secondary">Total</dt>
                  <dd className="text-lg font-semibold">
                    ${Number(order.totalAmount).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                <Truck className="h-5 w-5 text-secondary" />
                Order Status
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  orderColor[order.orderStatus]
                }`}
              >
                {orderLabel[order.orderStatus]}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

import type { Order, OrderItem } from "@prisma/client"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { OrderTimeline } from "@/components/orders/order-timeline"
import { ArrowLeft, CreditCard, Package } from "lucide-react"

type OrderWithItems = Order & { items: OrderItem[] }

export const dynamic = "force-dynamic"

const paymentLabel: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

const paymentColor: Record<string, string> = {
  PENDING: "text-amber-700 bg-amber-50",
  PAID: "text-success bg-success/5",
  FAILED: "text-error bg-error/5",
  REFUNDED: "text-blue-700 bg-blue-50",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  const { id } = await params

  let order: OrderWithItems | null = null
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
  } catch (error) {
    console.error("Failed to load order:", error)
  }

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
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <h1 className="heading-section text-text-primary">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
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
            <div className="border border-border-subtle p-6 bg-bg-surface">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-xl text-text-primary">
                <Package className="h-5 w-5 text-text-secondary" />
                Order Status
              </h2>
              <OrderTimeline orderStatus={order.orderStatus} paymentStatus={order.paymentStatus} />
            </div>

            <div className="border border-border-subtle p-6 bg-bg-surface">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-text-primary">
                <Package className="h-5 w-5 text-text-secondary" />
                Items
              </h2>
              <div className="divide-y divide-border-subtle">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {item.image && (
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-bg-secondary">
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
                      <p className="font-medium text-text-primary">{item.name}</p>
                      {item.size && (
                        <p className="mt-0.5 text-sm text-text-secondary">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-text-secondary">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="flex-shrink-0 font-medium text-text-primary">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-border-subtle p-6 bg-bg-surface">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-text-primary">
                <CreditCard className="h-5 w-5 text-text-secondary" />
                Payment
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-text-secondary">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${paymentColor[order.paymentStatus]}`}
                    >
                      {paymentLabel[order.paymentStatus]}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-text-secondary">Total</dt>
                  <dd className="text-lg font-serif text-text-primary">
                    ${Number(order.totalAmount).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type RecentOrder = {
  id: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  createdAt: Date
  user: { name: string | null; email: string | null } | null
  itemCount: number
}

const statusColor: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  PROCESSING: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
  DELIVERED: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card as="div">
      <CardHeader>
        <p className="text-sm font-medium text-secondary">
          Recent Orders
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders`}
              className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-foreground/[0.06]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  #{order.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 text-xs text-secondary">
                  {order.user?.name ?? "Unknown"} &middot;{" "}
                  {order.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  ${order.totalAmount.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColor[order.orderStatus] ?? ""
                  }`}
                >
                  {statusLabel[order.orderStatus] ?? order.orderStatus}
                </span>
                <ChevronRight className="h-4 w-4 text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

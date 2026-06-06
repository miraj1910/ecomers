"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"

type OrderItem = {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  size: string | null
  image: string | null
}

type Order = {
  id: string
  userId: string
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  createdAt: Date
  updatedAt: Date
  user: { name: string | null; email: string | null } | null
  items: OrderItem[]
  itemCount: number
}

type PageData = {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "success" | "destructive" | "secondary" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "destructive" },
}

const paymentStatusColor: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  PAID: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  REFUNDED: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  FAILED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
}

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
]

export function AdminOrdersClient({ initialData }: { initialData: PageData }) {
  const router = useRouter()
  const [data, setData] = useState<PageData>(initialData)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(false)
  const [statusModal, setStatusModal] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<Order | null>(null)

  const fetchPage = useCallback(
    async (page: number, status?: string, q?: string) => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", page.toString())
      if (status && status !== "ALL") params.set("status", status)
      if (q) params.set("search", q)

      const res = await fetch(`/api/admin/orders?${params}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    },
    []
  )

  const handleSearch = useCallback(() => {
    fetchPage(1, statusFilter, search)
  }, [search, statusFilter, fetchPage])

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      setUpdating(orderId)
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      })
      setUpdating(null)
      setStatusModal(null)
      fetchPage(data.page, statusFilter, search)
      router.refresh()
    },
    [data.page, statusFilter, search, fetchPage, router]
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Manage customer orders
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by order ID, customer name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <select
          className="rounded-xl border border-border bg-foreground/[0.07] px-3 py-2 text-sm text-foreground backdrop-blur-xl"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            fetchPage(1, e.target.value, search)
          }}
        >
          <option value="ALL">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-foreground/[0.05]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-foreground/[0.05]"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    #{order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {order.user?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-secondary">
                    {order.user?.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm">{order.itemCount}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      paymentStatusColor[order.paymentStatus] ?? ""
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={statusConfig[order.orderStatus]?.variant ?? "secondary"}
                    size="sm"
                  >
                    {statusConfig[order.orderStatus]?.label ?? order.orderStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setStatusModal(order)
                        setNewStatus(order.orderStatus)
                      }}
                      className="inline-flex h-8 items-center rounded-lg px-2 text-xs font-medium text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => setDetailModal(order)}
                      className="inline-flex h-8 items-center rounded-lg px-2 text-xs font-medium text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.orders.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-secondary/50" />
          <p className="text-sm text-secondary">No orders found</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-secondary">
          Showing {(data.page - 1) * data.pageSize + 1} -{" "}
          {Math.min(data.page * data.pageSize, data.total)} of {data.total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data.page <= 1 || loading}
            onClick={() => fetchPage(data.page - 1, statusFilter, search)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-secondary">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.page >= data.totalPages || loading}
            onClick={() => fetchPage(data.page + 1, statusFilter, search)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!statusModal} onClose={() => setStatusModal(null)}>
        <DialogHeader>
          <DialogTitle>
            Update Order Status
            {statusModal && (
              <span className="ml-2 text-sm font-normal text-secondary">
                #{statusModal.id.slice(0, 8)}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-foreground/[0.04] p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary">Customer</span>
                  <p className="font-medium text-foreground">
                    {statusModal?.user?.name ?? "Unknown"}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Total</span>
                  <p className="font-medium text-foreground">
                    ${statusModal?.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Current Status</span>
                  <p className="font-medium text-foreground">
                    {statusModal?.orderStatus}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Payment</span>
                  <p className="font-medium text-foreground">
                    {statusModal?.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
            <Select
              label="New Status"
              id="newStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStatusModal(null)}>
            Cancel
          </Button>
          <Button
            disabled={
              updating === statusModal?.id ||
              newStatus === statusModal?.orderStatus
            }
            onClick={() =>
              statusModal && handleStatusChange(statusModal.id, newStatus)
            }
          >
            {updating === statusModal?.id ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!detailModal} onClose={() => setDetailModal(null)}>
        <DialogHeader>
          <DialogTitle>
            Order Details
            {detailModal && (
              <span className="ml-2 text-sm font-normal text-secondary">
                #{detailModal.id.slice(0, 8)}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-foreground/[0.04] p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary">Customer</span>
                  <p className="font-medium text-foreground">
                    {detailModal?.user?.name ?? "Unknown"}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Email</span>
                  <p className="font-medium text-foreground">
                    {detailModal?.user?.email ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Date</span>
                  <p className="font-medium text-foreground">
                    {detailModal &&
                      new Date(detailModal.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Total</span>
                  <p className="font-medium text-foreground">
                    ${detailModal?.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Order Status</span>
                  <p className="font-medium text-foreground">
                    {detailModal?.orderStatus}
                  </p>
                </div>
                <div>
                  <span className="text-secondary">Payment Status</span>
                  <p className="font-medium text-foreground">
                    {detailModal?.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
            {detailModal && detailModal.items.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-secondary">
                  Items ({detailModal.itemCount})
                </h4>
                <div className="space-y-2">
                  {detailModal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-secondary">
                            Qty: {item.quantity}
                            {item.size && ` | Size: ${item.size}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailModal(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

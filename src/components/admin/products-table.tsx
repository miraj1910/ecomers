"use client"

import { useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { DataTable, DataTablePagination } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  Eye,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ProductItem = {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  brand: string | null
  price: number
  discountPrice: number | null
  stock: number
  sku: string
  images: string[]
  status: string
  createdAt: Date
  updatedAt: Date
}

type PageData = {
  products: ProductItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  categories: string[]
}

export function AdminProductsTable({ initialData }: { initialData: PageData }) {
  const router = useRouter()
  const [data, setData] = useState<PageData>(initialData)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const fetchData = useCallback(
    async (params: Record<string, string>) => {
      setLoading(true)
      const qs = new URLSearchParams(params)
      const res = await fetch(`/api/admin/products?${qs}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    },
    []
  )

  const handleSearch = useCallback(() => {
    const params: Record<string, string> = { page: "1" }
    if (search) params.search = search
    if (categoryFilter !== "ALL") params.category = categoryFilter
    if (statusFilter !== "ALL") params.status = statusFilter
    fetchData(params)
  }, [search, categoryFilter, statusFilter, fetchData])

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "category") setCategoryFilter(value)
      if (key === "status") setStatusFilter(value)
      const params: Record<string, string> = { page: "1" }
      if (search) params.search = search
      if (key === "category" && value !== "ALL") params.category = value
      else if (key !== "category" && categoryFilter !== "ALL")
        params.category = categoryFilter
      if (key === "status" && value !== "ALL") params.status = value
      else if (key !== "status" && statusFilter !== "ALL")
        params.status = statusFilter
      fetchData(params)
    },
    [search, categoryFilter, statusFilter, fetchData]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      setDeleteDialog(null)
      const params: Record<string, string> = { page: String(data.page) }
      if (search) params.search = search
      if (categoryFilter !== "ALL") params.category = categoryFilter
      if (statusFilter !== "ALL") params.status = statusFilter
      fetchData(params)
      router.refresh()
    },
    [search, categoryFilter, statusFilter, data.page, fetchData, router]
  )

  const columnHelper = createColumnHelper<ProductItem>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-foreground/[0.06]">
              {row.original.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.original.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-4 w-4 text-secondary" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {row.original.name}
              </p>
              <p className="text-xs text-secondary">SKU: {row.original.sku}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => (
          <span className="text-secondary">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        sortingFn: "basic",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="font-medium text-foreground">
              {formatPrice(row.original.price)}
            </span>
            {row.original.discountPrice && (
              <span className="ml-2 text-xs text-sale line-through">
                {formatPrice(row.original.discountPrice)}
              </span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: ({ getValue }) => {
          const stock = getValue()
          return (
            <span
              className={
                stock <= 0
                  ? "text-red-500"
                  : stock <= 5
                    ? "text-amber-500"
                    : "text-emerald-500"
              }
            >
              {stock}
            </span>
          )
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue()
          return (
            <Badge
              variant={status === "ACTIVE" ? "success" : "secondary"}
              size="sm"
            >
              {status}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: ({ getValue }) => (
          <span className="text-secondary">
            {new Date(getValue()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/products/${row.original.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/products/${row.original.slug}`}
              target="_blank"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setDeleteDialog(row.original.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper]
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: data.products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data.totalPages,
    initialState: { pagination: { pageIndex: data.page - 1, pageSize: data.pageSize } },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          options={[
            { value: "ALL", label: "All Categories" },
            ...data.categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          options={[
            { value: "ALL", label: "All Statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
        />
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      <DataTable table={table} isLoading={loading} emptyMessage="No products found" />
      <DataTablePagination table={table} />

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-secondary">
            Are you sure you want to delete this product? This action uses soft delete and can be reversed by an administrator.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialog(null)}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-600"
            onClick={() => deleteDialog && handleDelete(deleteDialog)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

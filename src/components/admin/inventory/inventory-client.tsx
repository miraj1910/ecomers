"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"
import type { InventoryPageData, InventoryItem } from "@/types/prisma"

function StockBadge({ item }: { item: InventoryItem }) {
  const available = item.stock - item.reservedStock

  if (item.stock <= 0 || available <= 0) {
    return (
      <Badge variant="destructive" size="sm">
        <XCircle className="mr-1 h-3 w-3" />
        Out of Stock
      </Badge>
    )
  }

  if (available <= item.lowStockThreshold) {
    return (
      <Badge variant="destructive" size="sm">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Low Stock ({available})
      </Badge>
    )
  }

  return (
    <Badge variant="success" size="sm">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      In Stock ({available})
    </Badge>
  )
}

function EditableCell({
  value,
  onSave,
  type = "number",
}: {
  value: number | string
  onSave: (val: number | string) => Promise<void>
  type?: "number" | "text"
}) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const finalValue = type === "number" ? Number(inputValue) : String(inputValue)
      await onSave(finalValue)
      setEditing(false)
    } catch {
      setInputValue(value)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setInputValue(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        {type === "number" ? (
          <Input
            type="number"
            min={0}
            className="h-8 w-24 text-xs"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        ) : (
          <Input
            className="h-8 w-32 text-xs"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <button
      className="cursor-pointer rounded-lg px-1 py-0.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.08]"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
    </button>
  )
}

export function InventoryClient({
  initialData,
}: {
  initialData: InventoryPageData
}) {
  const router = useRouter()
  const [data, setData] = useState<InventoryPageData>(initialData)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, number>>({})
  const [savingBulk, setSavingBulk] = useState(false)

  const fetchPage = useCallback(
    async (page: number, q?: string) => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", page.toString())
      if (q) params.set("search", q)

      const res = await fetch(`/api/admin/inventory?${params}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    },
    []
  )

  const handleSearch = useCallback(() => {
    fetchPage(1, search)
  }, [search, fetchPage])

  const handleUpdateStock = useCallback(
    async (productId: string, stock: number) => {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update stock")
      }
      fetchPage(data.page, search)
      router.refresh()
    },
    [data.page, search, fetchPage, router]
  )

  const handleUpdateThreshold = useCallback(
    async (productId: string, lowStockThreshold: number) => {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, lowStockThreshold }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update threshold")
      }
      fetchPage(data.page, search)
      router.refresh()
    },
    [data.page, search, fetchPage, router]
  )

  const handleUpdateSku = useCallback(
    async (productId: string, sku: string) => {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, sku }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update SKU")
      }
      fetchPage(data.page, search)
      router.refresh()
    },
    [data.page, search, fetchPage, router]
  )

  const handleBulkUpdate = useCallback(async () => {
    setSavingBulk(true)
    const entries = Object.entries(bulkUpdates)
    for (const [productId, stock] of entries) {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock }),
      })
    }
    setBulkUpdates({})
    setBulkMode(false)
    setSavingBulk(false)
    fetchPage(data.page, search)
    router.refresh()
  }, [bulkUpdates, data.page, search, fetchPage, router])

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    productId: "",
    sku: "",
    stock: 0,
    lowStockThreshold: 5,
  })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add inventory item")
      }
      setShowAddModal(false)
      setAddForm({ productId: "", sku: "", stock: 0, lowStockThreshold: 5 })
      fetchPage(data.page, search)
      router.refresh()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add inventory item")
    } finally {
      setAdding(false)
    }
  }, [addForm, data.page, search, fetchPage, router])

  const [removing, setRemoving] = useState<string | null>(null)

  const handleRemoveItem = useCallback(async (productId: string) => {
    if (!window.confirm("Are you sure you want to remove this item from inventory?")) return
    setRemoving(productId)
    try {
      const res = await fetch(`/api/admin/inventory?productId=${productId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to remove inventory item")
      }
      fetchPage(data.page, search)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove inventory item")
    } finally {
      setRemoving(null)
    }
  }, [data.page, search, fetchPage, router])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Manage product stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button
            variant={bulkMode ? "primary" : "outline"}
            onClick={() => {
              setBulkMode(!bulkMode)
              setBulkUpdates({})
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {bulkMode ? "Exit Bulk Mode" : "Bulk Update"}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by product ID or SKU..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {bulkMode && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <span className="text-sm text-secondary">
            Click stock values to edit, then save all changes at once.
          </span>
          <Button
            size="sm"
            onClick={handleBulkUpdate}
            disabled={savingBulk || Object.keys(bulkUpdates).length === 0}
          >
            {savingBulk
              ? "Saving..."
              : `Save ${Object.keys(bulkUpdates).length} Change(s)`}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBulkUpdates({})
              setBulkMode(false)
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-foreground/[0.05]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Product ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Reserved
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Available
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Low Stock Threshold
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
            {data.items.map((item) => {
              const available = item.stock - item.reservedStock
              const isLow = available > 0 && available <= item.lowStockThreshold
              const isOut = item.stock <= 0 || available <= 0

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-foreground/[0.05] ${
                    isOut
                      ? "bg-error/5"
                      : isLow
                        ? "bg-accent/5"
                        : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{item.productId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={item.sku}
                      onSave={(val) =>
                        handleUpdateSku(item.productId, String(val))
                      }
                      type="text"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {bulkMode ? (
                      <Input
                        type="number"
                        min={0}
                        className="h-8 w-24 text-xs"
                        value={bulkUpdates[item.productId] ?? item.stock}
                        onChange={(e) =>
                          setBulkUpdates((prev) => ({
                            ...prev,
                            [item.productId]: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    ) : (
                      <EditableCell
                        value={item.stock}
                        onSave={(val) =>
                          handleUpdateStock(item.productId, Number(val))
                        }
                        type="number"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {item.reservedStock}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        isOut
                          ? "text-error"
                          : isLow
                            ? "text-accent"
                            : "text-success"
                      }`}
                    >
                      {available}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={item.lowStockThreshold}
                      onSave={(val) =>
                        handleUpdateThreshold(
                          item.productId,
                          Number(val)
                        )
                      }
                      type="number"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge item={item} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-secondary hover:text-error"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={removing === item.productId}
                      title="Remove from inventory"
                    >
                      {removing === item.productId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data.items.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="mb-3 h-10 w-10 text-secondary/50" />
          <p className="text-sm text-secondary">
            No inventory items found
          </p>
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
            onClick={() => fetchPage(data.page - 1, search)}
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
            onClick={() => fetchPage(data.page + 1, search)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Dialog open={showAddModal} onClose={() => { setShowAddModal(false); setAddError(null) }}>
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddItem}>
          <DialogContent>
            <div className="space-y-4">
              {addError && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/12 px-4 py-3 text-sm text-red-300">
                  {addError}
                </div>
              )}
              <div>
                <label htmlFor="add-productId" className="mb-1.5 block text-sm font-medium text-secondary">
                  Product ID
                </label>
                <Input
                  id="add-productId"
                  required
                  value={addForm.productId}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, productId: e.target.value }))}
                  placeholder="e.g. cmq0hym..."
                />
              </div>
              <div>
                <label htmlFor="add-sku" className="mb-1.5 block text-sm font-medium text-secondary">
                  SKU
                </label>
                <Input
                  id="add-sku"
                  required
                  value={addForm.sku}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g. PRD-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-stock" className="mb-1.5 block text-sm font-medium text-secondary">
                    Stock
                  </label>
                  <Input
                    id="add-stock"
                    type="number"
                    min="0"
                    value={addForm.stock}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label htmlFor="add-threshold" className="mb-1.5 block text-sm font-medium text-secondary">
                    Low Stock Threshold
                  </label>
                  <Input
                    id="add-threshold"
                    type="number"
                    min="0"
                    value={addForm.lowStockThreshold}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowAddModal(false); setAddError(null) }}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

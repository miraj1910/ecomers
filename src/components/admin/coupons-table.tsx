"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import type { CouponInput } from "@/lib/validations/coupon"

interface Coupon {
  id: string
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  active: boolean
  usageLimit: number
  usedCount: number
  minAmount: number | null
  expiresAt: string | null
  createdAt: string
}

interface AdminCouponsClientProps {
  initialData: {
    coupons: Coupon[]
    total: number
    page: number
    totalPages: number
  }
}

export function AdminCouponsClient({ initialData }: AdminCouponsClientProps) {
  const router = useRouter()
  const [coupons, setCoupons] = useState(initialData.coupons)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CouponInput>({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    active: true,
    usageLimit: 0,
    usedCount: 0,
    minAmount: undefined,
    expiresAt: null,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to create coupon")
      }

      setShowForm(false)
      setForm({ code: "", type: "PERCENTAGE", value: 10, active: true, usageLimit: 0, usedCount: 0, minAmount: undefined, expiresAt: null })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/coupons`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !current }),
      })
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !current } : c)))
      router.refresh()
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return
    try {
      await fetch(`/api/admin/coupons`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Coupon
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-surface p-6 space-y-4">
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Value {form.type === "PERCENTAGE" ? "(%)" : "($)"}
              </label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Usage Limit (0 = unlimited)</label>
              <Input
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Min Order Amount ($)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.minAmount ?? ""}
                onChange={(e) => setForm({ ...form, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Expires At</label>
              <Input
                type="date"
                value={form.expiresAt ? form.expiresAt.split("T")[0] : ""}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Coupon"}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left font-medium text-secondary">Code</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Type</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Value</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Used</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Limit</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Expires</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Active</th>
              <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-surface/30">
                <td className="px-4 py-3 font-mono text-foreground">{coupon.code}</td>
                <td className="px-4 py-3 text-secondary">
                  {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                </td>
                <td className="px-4 py-3 text-secondary">{coupon.usedCount}</td>
                <td className="px-4 py-3 text-secondary">{coupon.usageLimit || "∞"}</td>
                <td className="px-4 py-3 text-secondary">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.active)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      coupon.active
                        ? "bg-success/10 text-success"
                        : "bg-red-500/20 text-error"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-secondary hover:text-error transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-secondary">
                  No coupons yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

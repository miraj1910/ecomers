"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/admin/image-upload"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

type ProductFormData = {
  name: string
  slug: string
  description: string
  category: string
  brand: string
  price: number
  discountPrice: number | null
  stock: number
  sku: string
  images: string[]
  status: "ACTIVE" | "INACTIVE"
}

interface ProductFormProps {
  initialData?: ProductFormData
  productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId

  const [formData, setFormData] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      description: "",
      category: "",
      brand: "",
      price: 0,
      discountPrice: null,
      stock: 0,
      sku: "",
      images: [],
      status: "ACTIVE",
    }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (key === "name" && !isEdit) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          ? String(value)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/products/${productId}`
        : "/api/admin/products"

      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save product")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-secondary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isEdit ? "Edit Product" : "New Product"}
            </h1>
            <p className="mt-1 text-sm text-secondary">
              {isEdit ? "Update product details" : "Add a new product to your store"}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/12 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Product Name"
                id="name"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Wireless Headphones Pro"
              />
              <Input
                label="Slug"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="e.g. wireless-headphones-pro"
              />
              <Textarea
                label="Description"
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Product description..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="e.g. Electronics"
                />
                <Input
                  label="Brand"
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  placeholder="e.g. Sony"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Pricing & Inventory
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    updateField("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
                <Input
                  label="Discount Price ($)"
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountPrice ?? ""}
                  onChange={(e) =>
                    updateField(
                      "discountPrice",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stock"
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    updateField("stock", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                />
                <Input
                  label="SKU"
                  id="sku"
                  required
                  value={formData.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                  placeholder="e.g. WHP-001"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Images
            </h2>
            <ImageUpload
              images={formData.images}
              onChange={(images) => updateField("images", images)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Status
            </h2>
            <Select
              label="Product Status"
              id="status"
              value={formData.status}
              onChange={(e) =>
                updateField("status", e.target.value as "ACTIVE" | "INACTIVE")
              }
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

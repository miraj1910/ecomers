"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Folder,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type CategoryItem = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export function AdminCategoriesTable({ initialData }: { initialData: CategoryItem[] }) {
  const router = useRouter()
  const [data, setData] = useState<CategoryItem[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setName("")
    setSlug("")
    setDescription("")
    setImage("")
  }

  const autoSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const handleCreate = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || autoSlug(name), description, image }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("Create failed:", err.error || res.statusText)
        return
      }
      setShowCreate(false)
      resetForm()
      router.refresh()
      const categories = await fetch("/api/admin/categories").then((r) => r.json())
      setData(categories)
    } catch (error) {
      console.error("Create failed:", error)
    }
    setSaving(false)
  }, [name, slug, description, image, router])

  const handleUpdate = useCallback(async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, slug, description, image }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("Update failed:", err.error || res.statusText)
        return
      }
      setEditingId(null)
      resetForm()
      router.refresh()
      const categories = await fetch("/api/admin/categories").then((r) => r.json())
      setData(categories)
    } catch (error) {
      console.error("Update failed:", error)
    }
    setSaving(false)
  }, [editingId, name, slug, description, image, router])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("Delete failed:", err.error || res.statusText)
        return
      }
      setDeleteId(null)
      router.refresh()
      const categories = await fetch("/api/admin/categories").then((r) => r.json())
      setData(categories)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }, [deleteId, router])

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description)
    setImage(cat.image)
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-secondary">Manage product categories</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-foreground/[0.05]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((cat) => (
              <tr key={cat.id} className="transition-colors hover:bg-foreground/[0.05]">
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                      />
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="Slug"
                      />
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        rows={2}
                      />
                      <Input
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Image URL (optional)"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/[0.06]">
                          <Folder className="h-4 w-4 text-secondary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-secondary line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <span className="text-sm text-secondary">{slug || autoSlug(name)}</span>
                  ) : (
                    <Badge variant="secondary" size="sm">{cat.slug}</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{cat.productCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {editingId === cat.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdate} disabled={saving}>
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)) }}
              placeholder="Category name"
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="category-slug"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
            <Input
              label="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !name}>
            {saving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-secondary">
            Are you sure? Products assigned to this category will have their category unset.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="primary" className="bg-error hover:bg-error/80" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

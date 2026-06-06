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
  Shield,
  User,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type UserData = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  status: string
  createdAt: Date
  orderCount: number
}

type PageData = {
  users: UserData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function AdminUsersClient({ initialData }: { initialData: PageData }) {
  const router = useRouter()
  const [data, setData] = useState<PageData>(initialData)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const fetchPage = useCallback(async (page: number, q?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    if (q) params.set("search", q)

    const res = await fetch(`/api/admin/users?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [])

  const handleSearch = useCallback(() => {
    fetchPage(1, search)
  }, [search, fetchPage])

  const handleAction = useCallback(
    async (userId: string, action: string, value: string) => {
      setUpdating(userId)
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      })
      setUpdating(null)
      fetchPage(data.page, search)
      router.refresh()
    },
    [data.page, search, fetchPage, router]
  )

  const handleDelete = useCallback(
    async (userId: string) => {
      setUpdating(userId)
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "delete" }),
      })
      setUpdating(null)
      setDeleteDialog(null)
      fetchPage(data.page, search)
      router.refresh()
    },
    [data.page, search, fetchPage, router]
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Users
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Manage user accounts and roles
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by name or email..."
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

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-foreground/[0.05]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-foreground/[0.05]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/[0.08]">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.name ?? "No name"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm">{user.orderCount}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      user.status === "ACTIVE" ? "success" : "destructive"
                    }
                    size="sm"
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "border border-indigo-400/20 bg-indigo-400/12 text-indigo-300"
                          : "text-secondary bg-foreground/[0.06]"
                      }`}
                    >
                      {user.role === "ADMIN" ? (
                        <Shield className="h-3 w-3" />
                      ) : null}
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        handleAction(
                          user.id,
                          "role",
                          user.role === "ADMIN" ? "CUSTOMER" : "ADMIN"
                        )
                      }
                      disabled={updating === user.id}
                      className="inline-flex h-8 items-center rounded-lg px-2 text-xs font-medium text-secondary transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-50"
                      title={user.role === "ADMIN" ? "Demote to Customer" : "Promote to Admin"}
                    >
                      {user.role === "ADMIN" ? "Demote" : "Promote"}
                    </button>
                    {user.status === "ACTIVE" ? (
                      <button
                        onClick={() =>
                          handleAction(user.id, "status", "BLOCKED")
                        }
                        disabled={updating === user.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-50"
                        title="Block User"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAction(user.id, "status", "ACTIVE")
                        }
                        disabled={updating === user.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-50"
                        title="Unblock User"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteDialog(user.id)}
                      disabled={updating === user.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      title="Delete User"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.users.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <User className="mb-3 h-10 w-10 text-secondary/50" />
          <p className="text-sm text-secondary">No users found</p>
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

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-secondary">
            Are you sure you want to delete this user? This action uses soft
            delete and can be reversed.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialog(null)}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-600"
            disabled={updating === deleteDialog}
            onClick={() => deleteDialog && handleDelete(deleteDialog)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

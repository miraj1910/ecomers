"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Lock, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Invalid password")
      }

      window.location.href = "/admin"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="bg-bg-surface border border-border-subtle w-full max-w-sm space-y-6 p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-text-primary/10 bg-text-primary/5">
              <Lock className="h-6 w-6 text-text-primary" />
            </div>
            <h1 className="font-serif text-2xl text-text-primary">Admin Access</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Enter the admin password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="border border-error/20 bg-error/5 px-3 py-2 text-center text-sm text-error">
                {error}
              </p>
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full border-b border-border-subtle bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || !password}
              className="flex w-full items-center justify-center gap-2 bg-text-primary px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {loading ? "Verifying..." : "Access Admin"}
            </button>
          </form>
        </div>
      </div>
    </Container>
  )
}

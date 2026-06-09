"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container } from "@/components/layout/container"
import { Lock, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
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

      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="bg-surface border border-border w-full max-w-sm space-y-6 rounded-3xl p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Access</h1>
            <p className="mt-1 text-sm text-secondary">
              Enter the admin password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-center text-sm text-red-300">
                {error}
              </p>
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full rounded-xl border border-border bg-foreground/[0.07] px-4 py-3 text-sm text-white placeholder:text-secondary focus:border-accent focus:outline-none backdrop-blur-xl"
            />

            <button
              type="submit"
              disabled={loading || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white disabled:opacity-50"
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

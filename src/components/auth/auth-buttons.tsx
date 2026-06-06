"use client"

import { useSession } from "next-auth/react"
import { UserMenu } from "@/components/auth/user-menu"
import User from "lucide-react/dist/esm/icons/user"
import Link from "next/link"

export function AuthButtons() {
  const { data: session, status } = useSession()
  const isLoaded = status !== "loading"

  if (!isLoaded) return <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />

  if (session?.user) return <UserMenu />

  return (
    <Link
      href="/sign-in"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-secondary transition-colors hover:text-foreground hover:border-border"
    >
      <User className="h-4 w-4" />
    </Link>
  )
}

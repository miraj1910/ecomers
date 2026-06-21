"use client"

import { useSession } from "next-auth/react"
import { UserMenu } from "@/components/auth/user-menu"
import { User } from "lucide-react"
import Link from "next/link"

export function AuthButtons() {
  const { data: session, status } = useSession()
  const isLoaded = status !== "loading"

  if (!isLoaded) return <div className="h-8 w-8 rounded-full bg-border-subtle animate-pulse" />

  if (session?.user) return <UserMenu />

  return (
    <Link
      href="/sign-in"
      className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
    >
      <User className="h-[18px] w-[18px]" />
    </Link>
  )
}

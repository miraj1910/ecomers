"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { User, LogOut, Package, Heart, Settings } from "lucide-react"

interface UserMenuProps {
  light?: boolean
}

export function UserMenu({ light }: UserMenuProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) return null

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        aria-label="User menu"
      >
        <div className="h-8 w-8 flex items-center justify-center bg-border-subtle text-text-primary text-xs font-medium">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white border border-border-subtle shadow-sm z-50">
          <div className="px-5 py-4 border-b border-border-subtle">
            <p className="text-sm font-medium text-text-primary truncate">{session.user.name}</p>
            <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-warm transition-colors"
            >
              <Settings className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-warm transition-colors"
            >
              <Package className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-warm transition-colors"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
          </div>

          <div className="border-t border-border-subtle py-2">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-warm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

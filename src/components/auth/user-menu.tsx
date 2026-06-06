"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import {
  User,
  Heart,
  Package,
  LogOut,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

const links = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "Orders", icon: Package },
]

export function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const user = session?.user
  if (!user) return null

  const name = user.name ?? "User"
  const email = user.email ?? ""
  const image = user.image

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-accent/15 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
        aria-label="User menu"
        aria-expanded={open}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-background/95 backdrop-blur-2xl p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium truncate text-foreground">{name}</p>
            <p className="text-xs text-secondary truncate">{email}</p>
          </div>

          <div className="py-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-secondary transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="border-t border-border pt-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-secondary transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

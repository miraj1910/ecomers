"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { title: "Shop", href: "/products" },
  { title: "Collections", href: "/category/clothing" },
  { title: "Journal", href: "/blog" },
  { title: "About", href: "/about" },
]

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center gap-8", className)}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative py-2 text-[0.68rem] font-bold uppercase tracking-[0.28em] transition-colors",
              isActive ? "text-foreground" : "text-secondary hover:text-foreground"
            )}
          >
            {link.title}
            {isActive && (
              <span className="absolute -bottom-0.5 left-0 h-px w-full bg-foreground" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

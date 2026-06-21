"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { title: "Shop", href: "/products" },
  { title: "Collections", href: "/category/all" },
  { title: "Journal", href: "/blog" },
  { title: "About", href: "/about" },
]

interface NavLinksProps {
  className?: string
}

export function NavLinks({ className }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "relative text-[0.7rem] font-medium tracking-[0.15em] uppercase transition-colors duration-300",
            pathname === link.href
              ? "text-text-primary"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          {link.title}
          {pathname === link.href && (
            <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-text-primary" />
          )}
        </Link>
      ))}
    </nav>
  )
}

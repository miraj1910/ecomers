"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import X from "lucide-react/dist/esm/icons/x"
import { Button } from "@/components/ui/button"

const links = [
  { title: "Shop", href: "/products" },
  { title: "Collections", href: "/category/clothing" },
  { title: "Journal", href: "/blog" },
  { title: "About", href: "/about" },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!open) return null

  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-80 max-w-[86vw] border-l border-border bg-surface/95 px-7 py-6 shadow-2xl backdrop-blur-2xl md:hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <span className="editorial-kicker text-muted">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-col border-y border-border py-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "py-4 font-serif text-3xl font-normal leading-none transition-colors",
                pathname === link.href
                  ? "text-foreground"
                  : "text-secondary hover:text-foreground"
              )}
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  )
}

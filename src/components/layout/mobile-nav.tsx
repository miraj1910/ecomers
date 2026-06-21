"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const links = [
  { title: "Shop", href: "/products" },
  { title: "Collections", href: "/category/all" },
  { title: "Journal", href: "/blog" },
  { title: "About", href: "/about" },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  if (!mounted) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="mobile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-96 max-w-[85vw] bg-white px-10 py-10"
          >
            <div className="flex items-center justify-between mb-12">
              <span className="text-[0.65rem] font-medium tracking-[0.2em] uppercase text-text-muted">Navigation</span>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block py-5 font-serif text-4xl font-normal leading-none tracking-tight transition-colors border-b border-border-subtle",
                      pathname === link.href
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

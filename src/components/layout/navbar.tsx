"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { NavLinks } from "./nav-links"
import { SearchBar } from "@/components/search/search-bar"
import { AuthButtons } from "@/components/auth/auth-buttons"
import { useCart } from "@/store/cart"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { CartDrawer } from "@/components/cart/cart-drawer"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCart((s) => s.itemCount())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-border-subtle",
          scrolled
            ? "bg-white/90 backdrop-blur-xl"
            : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="editorial-container flex h-20 items-center justify-between">
          <Link href="/" className="shrink-0">
            <span className="font-serif text-2xl tracking-[0.3em] uppercase text-text-primary">
              ATELIER
            </span>
          </Link>

          <NavLinks className="hidden lg:flex items-center gap-12" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <AuthButtons />

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center bg-text-primary px-1 text-[8px] font-medium text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center lg:hidden text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border-subtle bg-white/95 backdrop-blur-xl">
            <div className="editorial-container py-6">
              <SearchBar placeholder="Search the collection..." />
            </div>
          </div>
        )}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

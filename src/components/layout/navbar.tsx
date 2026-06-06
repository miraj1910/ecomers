"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLinks } from "./nav-links"
import { SearchBar } from "@/components/search/search-bar"
import { AuthButtons } from "@/components/auth/auth-buttons"
import { useCart } from "@/store/cart"
import { useScroll } from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { CartDrawer } from "@/components/cart/cart-drawer"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const itemCount = useCart((s) => s.itemCount())
  const scrolled = useScroll()

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/90 shadow-[0_1px_18px_rgba(35,30,24,0.05)] backdrop-blur-xl"
            : "border-b border-border bg-background/95"
        )}
      >
        <div className="editorial-container grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link href="/" className="justify-self-start">
            <span className="font-serif text-xl uppercase tracking-[0.48em] text-foreground sm:text-2xl">
              STORE
            </span>
          </Link>

          <NavLinks className="hidden justify-self-center lg:flex" />

          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-foreground"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <AuthButtons />

            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-foreground/[0.06]"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="editorial-container pb-4">
            <SearchBar placeholder="Search the collection..." />
          </div>
        )}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

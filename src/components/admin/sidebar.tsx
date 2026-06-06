"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Warehouse,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-[rgba(18,18,24,0.88)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">Storefront</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-purple shadow-[0_12px_28px_rgba(111,53,189,0.2)]"
                  : "text-secondary hover:bg-foreground/[0.07] hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-secondary">Admin Panel</p>
      </div>
    </aside>
  )
}

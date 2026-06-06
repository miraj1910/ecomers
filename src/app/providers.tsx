"use client"

import { ThemeProvider } from "@/components/shared/theme-provider"
import { SessionProvider } from "@/components/auth/session-provider"
import { CartSyncManager } from "@/components/cart/cart-sync-manager"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <CartSyncManager />
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}

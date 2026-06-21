"use client"

import { SessionProvider } from "@/components/auth/session-provider"
import { CartSyncManager } from "@/components/cart/cart-sync-manager"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSyncManager />
      {children}
    </SessionProvider>
  )
}

import { prisma } from "@/lib/prisma"
import { sendCartRecoveryEmail } from "@/lib/email/triggers"
import type { Prisma } from "@prisma/client"

const DEFAULT_DELAY_HOURS = 24

interface CartItemData {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
}

export function getRecoveryDelayHours(): number {
  const env = process.env.CART_RECOVERY_DELAY_HOURS
  if (env) {
    const parsed = parseInt(env, 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return DEFAULT_DELAY_HOURS
}

export async function trackCartForRecovery(
  email: string,
  userId?: string | null,
  cartData?: { items: CartItemData[] }
): Promise<void> {
  if (!email) return

  const existing = await prisma.cartRecovery.findFirst({
    where: { email, recoveredAt: null, emailSentAt: null },
  })

  if (existing) {
    // Update existing pending recovery with fresh cart data
    await prisma.cartRecovery.update({
      where: { id: existing.id },
      data: {
        cartData: (cartData ?? {}) as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    })
    return
  }

  await prisma.cartRecovery.create({
    data: {
      email,
      userId: userId ?? null,
      cartData: (cartData ?? {}) as Prisma.InputJsonValue,
    },
  })
}

export async function processPendingRecoveries(): Promise<number> {
  const delayHours = getRecoveryDelayHours()
  const cutoff = new Date(Date.now() - delayHours * 60 * 60 * 1000)

  const pending = await prisma.cartRecovery.findMany({
    where: {
      emailSentAt: null,
      recoveredAt: null,
      createdAt: { lte: cutoff },
    },
  })

  let sent = 0
  for (const recovery of pending) {
    try {
      const items = (recovery.cartData as { items?: CartItemData[] })?.items ?? []
      if (items.length === 0) {
        // No items in cart anymore — mark as stale
        await prisma.cartRecovery.update({
          where: { id: recovery.id },
          data: { emailSentAt: new Date(0) }, // sent at epoch = stale
        })
        continue
      }

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      await sendCartRecoveryEmail({
        email: recovery.email,
        cartItems: items,
        total,
        recoveryId: recovery.id,
      })

      await prisma.cartRecovery.update({
        where: { id: recovery.id },
        data: { emailSentAt: new Date() },
      })

      sent++
    } catch (error) {
      console.error(`[CartRecovery] Failed to process ${recovery.id}:`, error)
    }
  }

  return sent
}

export async function markRecoveredByEmail(email: string): Promise<void> {
  await prisma.cartRecovery.updateMany({
    where: { email, recoveredAt: null },
    data: { recoveredAt: new Date() },
  })
}

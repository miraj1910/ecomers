"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { addressSchema } from "@/lib/validations/address"
import type { ServerActionResult } from "@/types/prisma"

export async function saveAddress(data: unknown): Promise<ServerActionResult<string>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const parsed = addressSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: parsed.data.fullName,
        street: parsed.data.street,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        phone: parsed.data.phone,
        isDefault: parsed.data.isDefault,
      },
    })

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, id: { not: address.id }, isDefault: true },
        data: { isDefault: false },
      })
    }

    revalidatePath("/profile")
    return { success: true, data: address.id }
  } catch (error) {
    console.error("Save address error:", error)
    return { success: false, error: "Failed to save address" }
  }
}

export async function getUserAddresses(): Promise<ServerActionResult<import("@/types/prisma").AddressData[]>> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    })

    return {
      success: true,
      data: addresses.map((a) => ({
        fullName: a.fullName,
        street: a.street ?? undefined,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        phone: a.phone ?? undefined,
        isDefault: a.isDefault,
      })),
    }
  } catch (error) {
    console.error("Fetch addresses error:", error)
    return { success: false, error: "Failed to fetch addresses" }
  }
}

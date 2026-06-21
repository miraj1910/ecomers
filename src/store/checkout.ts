import { create } from "zustand"

const STORAGE_KEY = "checkout_address"

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode: string
}

interface CheckoutState {
  address: ShippingAddress | null
  setAddress: (address: ShippingAddress) => void
  clearCheckout: () => void
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  address: null,
  setAddress: (address) => {
    set({ address })
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(address))
      } catch {
        /* storage unavailable */
      }
    }
  },
  clearCheckout: () => {
    set({ address: null })
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* storage unavailable */
      }
    }
  },
}))

export function loadSavedAddress(): ShippingAddress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ShippingAddress
  } catch {
    return null
  }
}

import { create } from "zustand"

const GUEST_WISHLIST_KEY = "wishlist"

export interface WishlistItem {
  productId: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  clearWishlist: () => void
  setItems: (items: WishlistItem[]) => void
}

export const useWishlist = create<WishlistState>()((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      if (state.items.find((i) => i.productId === item.productId)) {
        return state
      }
      return { items: [...state.items, item] }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  isWishlisted: (productId) =>
    get().items.some((i) => i.productId === productId),

  clearWishlist: () => set({ items: [] }),

  setItems: (items) => set({ items }),
}))

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchServerWishlist(): Promise<WishlistItem[]> {
  try {
    const data = await apiCall<{ items: WishlistItem[] }>("/api/wishlist")
    return data.items
  } catch {
    return []
  }
}

export async function addToServerWishlist(productId: string): Promise<boolean> {
  try {
    await apiCall<{ success: boolean }>("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
    return true
  } catch {
    return false
  }
}

export async function mergeServerWishlist(productIds: string[]): Promise<boolean> {
  try {
    await apiCall<{ success: boolean }>("/api/wishlist/merge", {
      method: "POST",
      body: JSON.stringify({ productIds }),
    })
    return true
  } catch {
    return false
  }
}

export async function removeFromServerWishlist(productId: string): Promise<boolean> {
  try {
    await apiCall<{ success: boolean }>(`/api/wishlist/${productId}`, {
      method: "DELETE",
    })
    return true
  } catch {
    return false
  }
}

export function loadGuestWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY)
    if (!raw) return []
    return JSON.parse(raw) as WishlistItem[]
  } catch {
    return []
  }
}

export function saveGuestWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items))
  } catch {
    /* storage full or unavailable */
  }
}

export function clearGuestWishlist(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY)
  } catch {
    /* ignore */
  }
}

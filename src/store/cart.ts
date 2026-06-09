import { create } from "zustand"
import type { CartItem } from "@/types"
import { calculateSubtotal, totalItems, clampQuantity } from "@/lib/cart"

const GUEST_CART_KEY = "cart"

export interface ServerCartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null

  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number

  setItems: (items: CartItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

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

function pick(item: CartItem): ServerCartItem {
  return {
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    size: item.size,
    color: item.color,
  }
}

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        const maxStock = item.stock ?? existing.stock
        const nextQty = clampQuantity(existing.quantity + 1, 1, maxStock)
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: nextQty, stock: maxStock } : i
          ),
          error: null,
        }
      }
      return {
        items: [
          ...state.items,
          { ...item, quantity: clampQuantity(item.quantity, 1, item.stock) },
        ],
        error: null,
      }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: clampQuantity(quantity, 1, i.stock) } : i
      ),
    })),

  clearCart: () => set({ items: [], error: null }),

  itemCount: () => totalItems(get().items),

  subtotal: () => calculateSubtotal(get().items),

  setItems: (items) => set({ items, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))

async function withSyncGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cart sync failed"
    useCart.getState().setError(msg)
    throw e
  }
}

export async function fetchServerCart(): Promise<void> {
  const { setItems, setLoading } = useCart.getState()

  setLoading(true)
  try {
    const data = await apiCall<{ items: ServerCartItem[] }>("/api/cart")
    setItems(
      data.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        size: i.size,
        color: i.color,
      }))
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load cart"
    useCart.getState().setError(msg)
  }
}

export async function addToServerCart(item: CartItem): Promise<void> {
  await withSyncGuard(async () => {
    const data = await apiCall<{ items: ServerCartItem[] }>("/api/cart", {
      method: "POST",
      body: JSON.stringify(pick(item)),
    })
    useCart.getState().setItems(
      data.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        size: i.size,
        color: i.color,
      }))
    )
  })
}

export async function updateServerCart(productId: string, quantity: number): Promise<void> {
  await withSyncGuard(async () => {
    const data = await apiCall<{ items: ServerCartItem[] }>(`/api/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
    useCart.getState().setItems(
      data.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        size: i.size,
        color: i.color,
      }))
    )
  })
}

export async function removeFromServerCart(productId: string): Promise<void> {
  await withSyncGuard(async () => {
    const data = await apiCall<{ items: ServerCartItem[] }>(`/api/cart/${productId}`, {
      method: "DELETE",
    })
    useCart.getState().setItems(
      data.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        size: i.size,
        color: i.color,
      }))
    )
  })
}

export function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

export function saveGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    /* storage full or unavailable */
  }
}

export async function mergeServerCart(items: CartItem[]): Promise<void> {
  if (items.length === 0) {
    await fetchServerCart()
    return
  }

  await withSyncGuard(async () => {
    const data = await apiCall<{ items: ServerCartItem[] }>("/api/cart/merge", {
      method: "POST",
      body: JSON.stringify({ items: items.map(pick) }),
    })
    useCart.getState().setItems(
      data.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        size: i.size,
        color: i.color,
      }))
    )
  })
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch {
    /* ignore */
  }
}

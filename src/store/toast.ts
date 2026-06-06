import { create } from "zustand"
import type { Toast } from "@/types"

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID?.() ?? Date.now().toString()
    const duration = toast.duration ?? 4000
    const newToast = { ...toast, id, duration } as Toast

    set((state) => ({ toasts: [...state.toasts, newToast] }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}))

import { useToastStore } from "@/store/toast"
import type { ToastVariant } from "@/types"

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)

  return {
    toast: (
      message: string,
      variant: ToastVariant = "info",
      description?: string
    ) => addToast({ message, variant, description }),
    success: (message: string, description?: string) =>
      addToast({ message, variant: "success", description }),
    error: (message: string, description?: string) =>
      addToast({ message, variant: "error", description }),
    info: (message: string, description?: string) =>
      addToast({ message, variant: "info", description }),
    warning: (message: string, description?: string) =>
      addToast({ message, variant: "warning", description }),
  }
}

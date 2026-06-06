export interface ProductCardData {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  rating: number
  reviewCount?: number
  image: string
  images?: string[]
  badge?: string
  inStock?: boolean
  description?: string
  tags?: string[]
  sizes?: string[]
}

export interface FilterOption {
  id: string
  label: string
  count?: number
}

export interface FilterGroup {
  id: string
  label: string
  type: "checkbox" | "radio" | "range"
  options: FilterOption[]
}

export interface PriceRange {
  min: number
  max: number
}

export interface CartItem {
  productId: string
  name: string
  slug?: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  stock?: number
}

export interface NavLink {
  title: string
  href: string
}

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export type ToastVariant = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

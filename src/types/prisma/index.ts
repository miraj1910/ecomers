import type { Role, PaymentStatus, OrderStatus } from "@prisma/client"

export type { Role, PaymentStatus, OrderStatus }

export type SafeUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: Role
}

export type OrderWithItems = {
  id: string
  userId: string
  stripeSessionId: string | null
  paymentIntentId: string | null
  totalAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: Date
  updatedAt: Date
  items: {
    id: string
    productId: string
    name: string
    quantity: number
    price: number
    size: string | null
    image: string | null
  }[]
}

export type AddressData = {
  fullName: string
  street?: string
  city: string
  state: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}

export type CreateOrderInput = {
  stripeSessionId?: string
  paymentIntentId?: string
  totalAmount: number
  items: {
    productId: string
    name: string
    quantity: number
    price: number
    size?: string
    image?: string
  }[]
}

export type InventoryUpdate = {
  productId: string
  stock?: number
  reservedStock?: number
  sku?: string
}

export type ServerActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export type InventoryItem = {
  id: string
  productId: string
  sku: string
  stock: number
  reservedStock: number
  lowStockThreshold: number
  availableStock: number
  updatedAt: Date
}

export type InventoryPageData = {
  items: InventoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock"

export type InventoryUpdateInput = {
  productId: string
  stock: number
  sku?: string
  lowStockThreshold?: number
}

export type AddInventoryInput = {
  productId: string
  sku: string
  stock: number
  lowStockThreshold: number
}

export type StockValidationResult = {
  valid: boolean
  insufficientItems: { productId: string; name: string; requested: number; available: number }[]
}

export type ReviewItem = {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: Date
  updatedAt: Date
  user: { id: string; name: string | null; image: string | null }
}

export type ReviewPageData = {
  reviews: ReviewItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ReviewInput = {
  productId: string
  rating: number
  title?: string
  comment?: string
}

export type ProductRatingSummary = {
  productId: string
  averageRating: number
  totalRatings: number
  distribution: number[]
}

export type UserReview = {
  id: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: Date
}

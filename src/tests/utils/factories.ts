import type { CartItem, ProductCardData } from "@/types"

export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "prod-1",
    name: "Test Product",
    price: 29.99,
    quantity: 1,
    image: "/test.jpg",
    stock: 10,
    ...overrides,
  }
}

export function createProductCardData(overrides: Partial<ProductCardData> = {}): ProductCardData {
  return {
    id: "prod-1",
    name: "Test Product",
    price: 29.99,
    image: "/test.jpg",
    category: "Clothing",
    rating: 4.5,
    inStock: true,
    ...overrides,
  }
}

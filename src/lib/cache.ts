import { unstable_cache } from "next/cache"

export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product-${slug}`,
  categories: "categories",
  featured: "featured",
  orders: "orders",
  reviews: "reviews",
  inventory: "inventory",
} as const

export function cached<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  key: string,
  tags: string[],
  revalidate = 60
): (...args: Args) => Promise<T> {
  return unstable_cache(fn, [key], { tags, revalidate })
}

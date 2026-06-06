export function formatCartPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function calculateSubtotal(
  items: { price: number; quantity: number }[]
): number {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0)
}

export function totalItems(items: { quantity: number }[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0)
}

export function isOverstock(
  currentQuantity: number,
  maxStock: number | undefined
): boolean {
  if (!maxStock) return false
  return currentQuantity >= maxStock
}

export function clampQuantity(
  desired: number,
  min: number,
  max: number | undefined
): number {
  let q = Math.max(desired, min)
  if (max != null) q = Math.min(q, max)
  return q
}

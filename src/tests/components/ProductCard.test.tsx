import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProductCard } from "@/components/products/product-card"
import { createProductCardData } from "../utils"

describe("ProductCard", () => {
  it("renders product name and price", () => {
    render(<ProductCard product={createProductCardData()} />)
    expect(screen.getByText("Test Product")).toBeInTheDocument()
    expect(screen.getByText("$29.99")).toBeInTheDocument()
  })

  it("renders category", () => {
    render(<ProductCard product={createProductCardData()} />)
    expect(screen.getByText("Clothing")).toBeInTheDocument()
  })

  it("renders rating", () => {
    render(<ProductCard product={createProductCardData({ rating: 4.5 })} />)
    expect(screen.getByText("4.5")).toBeInTheDocument()
  })

  it("renders badge when provided", () => {
    render(<ProductCard product={createProductCardData({ badge: "Sale" })} />)
    expect(screen.getByText("Sale")).toBeInTheDocument()
  })

  it("renders original price with strikethrough when provided", () => {
    render(<ProductCard product={createProductCardData({ originalPrice: 39.99 })} />)
    expect(screen.getByText("$39.99")).toBeInTheDocument()
  })

  it("shows out of stock overlay when not in stock", () => {
    render(<ProductCard product={createProductCardData({ inStock: false })} />)
    expect(screen.getByText("Out of Stock")).toBeInTheDocument()
  })

  it("does not show add to cart button when out of stock", () => {
    render(<ProductCard product={createProductCardData({ inStock: false })} onAddToCart={vi.fn()} />)
    expect(screen.queryByRole("button", { name: /add to cart/i })).not.toBeInTheDocument()
  })

  it("shows add to cart button when in stock", () => {
    render(<ProductCard product={createProductCardData({ inStock: true })} onAddToCart={vi.fn()} />)
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument()
  })

  it("calls onAddToCart when add to cart button is clicked", async () => {
    const onAddToCart = vi.fn()
    const product = createProductCardData({ inStock: true })
    const user = userEvent.setup()
    render(<ProductCard product={product} onAddToCart={onAddToCart} />)
    await user.click(screen.getByRole("button", { name: /add to cart/i }))
    expect(onAddToCart).toHaveBeenCalledWith(product)
  })

  it("calls onToggleWishlist when wishlist button is clicked", async () => {
    const onToggleWishlist = vi.fn()
    const product = createProductCardData()
    const user = userEvent.setup()
    render(<ProductCard product={product} onToggleWishlist={onToggleWishlist} />)
    await user.click(screen.getByRole("button", { name: /add to wishlist/i }))
    expect(onToggleWishlist).toHaveBeenCalledWith(product)
  })

  it("shows filled heart when wishlisted", () => {
    render(<ProductCard product={createProductCardData()} isWishlisted onToggleWishlist={vi.fn()} />)
    expect(screen.getByRole("button", { name: /remove from wishlist/i })).toBeInTheDocument()
  })

  it("renders review count when provided", () => {
    render(<ProductCard product={createProductCardData({ rating: 4.0, reviewCount: 12 })} />)
    expect(screen.getByText(/\(12\)/)).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/search/search-bar"

describe("SearchBar", () => {
  it("renders with placeholder text", () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument()
  })

  it("calls onSearch when Enter is pressed", async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByPlaceholderText("Search products...")
    await user.type(input, "shoes{Enter}")
    expect(onSearch).toHaveBeenCalledWith("shoes")
  })

  it("clears input when clear button is clicked", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByPlaceholderText("Search products...")
    await user.type(input, "shoes")
    expect(input).toHaveValue("shoes")
    const clearButton = screen.getByRole("button", { name: /clear/i })
    await user.click(clearButton)
    expect(input).toHaveValue("")
  })

  it("renders search input with aria label", () => {
    render(<SearchBar />)
    expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument()
  })
})

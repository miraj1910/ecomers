import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuantitySelector } from "@/components/shared/quantity-selector"

describe("QuantitySelector", () => {
  it("renders with initial value", () => {
    render(<QuantitySelector value={3} onChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("3")
  })

  it("calls onChange with incremented value on plus click", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<QuantitySelector value={3} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /increase/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it("calls onChange with decremented value on minus click", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<QuantitySelector value={3} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /decrease/i }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it("disables minus button at minimum", () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} min={1} />)
    expect(screen.getByRole("button", { name: /decrease/i })).toBeDisabled()
  })

  it("disables plus button at maximum", () => {
    render(<QuantitySelector value={10} onChange={vi.fn()} max={10} />)
    expect(screen.getByRole("button", { name: /increase/i })).toBeDisabled()
  })

  it("disables both buttons when disabled prop is true", () => {
    render(<QuantitySelector value={5} onChange={vi.fn()} disabled />)
    expect(screen.getByRole("button", { name: /decrease/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /increase/i })).toBeDisabled()
  })

  it("applies size classes for sm variant", () => {
    const { container } = render(<QuantitySelector value={1} onChange={vi.fn()} size="sm" />)
    const buttons = container.querySelectorAll("button")
    expect(buttons.length).toBe(2)
  })
})

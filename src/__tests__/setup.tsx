import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(() => {
  cleanup()
})

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

vi.mock("next/image", () => ({
  default: ({ src, alt, className, fill, priority, onLoad, sizes, ...props }: Record<string, unknown>) => {
    const imgProps: Record<string, unknown> = { ...props }
    if (fill) imgProps["data-fill"] = "true"
    if (priority) imgProps["data-priority"] = "true"
    if (sizes) imgProps["data-sizes"] = sizes
    return (
      <img
        src={src as string}
        alt={alt as string}
        className={className as string}
        onLoad={onLoad as () => void}
        {...imgProps}
      />
    )
  },
}))

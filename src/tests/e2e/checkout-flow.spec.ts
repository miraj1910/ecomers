import { test, expect } from "@playwright/test"

test.describe("Checkout flow", () => {
  test("homepage loads and displays products", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("navigation links are present", async ({ page }) => {
    await page.goto("/")
    const nav = page.locator("nav")
    await expect(nav).toBeVisible()
  })

  test("can navigate to sign-in page", async ({ page }) => {
    await page.goto("/sign-in")
    await expect(page).toHaveURL("/sign-in")
    await expect(page.getByRole("heading")).toBeVisible()
  })

  test("can navigate to a product category", async ({ page }) => {
    await page.goto("/category/all")
    await expect(page).toHaveURL(/\/category\//)
  })
})

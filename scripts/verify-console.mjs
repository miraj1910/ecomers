import { chromium } from "@playwright/test"

const routes = [
  "/",
  "/products",
  "/category/clothing",
  "/products/ceramic-mug-set",
  "/sign-in",
  "/sign-up",
  "/blog",
  "/about",
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

try {
  for (const path of routes) {
    const messages = []

    page.removeAllListeners("console")
    page.removeAllListeners("pageerror")

    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        messages.push(`${message.type().toUpperCase()}: ${message.text()}`)
      }
    })
    page.on("pageerror", (error) => {
      messages.push(`PAGEERROR: ${error.message}`)
    })

    const response = await page.goto(`http://localhost:3000${path}`, {
      waitUntil: "networkidle",
    })
    await page.waitForTimeout(1500)

    console.log(`\n${path} status=${response?.status() ?? "unknown"}`)
    console.log(messages.length ? messages.join("\n") : "no console warnings/errors")
  }
} finally {
  await browser.close()
}

import { chromium } from "@playwright/test"

const checks = [
  { path: "/", name: "home-desktop", viewport: { width: 1440, height: 1000 } },
  { path: "/", name: "home-mobile", viewport: { width: 390, height: 844 } },
  { path: "/products", name: "products-desktop", viewport: { width: 1440, height: 1000 } },
  { path: "/products", name: "products-mobile", viewport: { width: 390, height: 844 } },
]

const browser = await chromium.launch({ headless: true })

try {
  for (const check of checks) {
    const page = await browser.newPage({ viewport: check.viewport })
    await page.goto(`http://localhost:3000${check.path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(1000)

    const result = await page.evaluate(() => {
      const doc = document.documentElement
      const overflowX = doc.scrollWidth > doc.clientWidth + 1
      const zeroImages = Array.from(document.querySelectorAll("img")).filter((image) => {
        const rect = image.getBoundingClientRect()
        return rect.width === 0 || rect.height === 0
      }).length
      const visibleCards = Array.from(document.querySelectorAll("article, [role='img']")).filter((node) => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }).length

      return {
        overflowX,
        zeroImages,
        visibleCards,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      }
    })

    await page.screenshot({
      path: `/tmp/ecommers-${check.name}.png`,
      fullPage: true,
    })

    console.log(`${check.name}: ${JSON.stringify(result)}`)
    await page.close()
  }
} finally {
  await browser.close()
}

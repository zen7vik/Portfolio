// Dev-time helper: screenshot a route for visual verification.
// Usage: node scripts/shot.mjs <path> <outfile> [--mobile] [--wait <ms>]
import { chromium } from '@playwright/test'

const [, , route = '/', out = 'shot.png', ...rest] = process.argv
const mobile = rest.includes('--mobile')
const waitIdx = rest.indexOf('--wait')
const extraWait = waitIdx >= 0 ? Number(rest[waitIdx + 1]) : 800

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
})
await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(extraWait)
await page.screenshot({ path: out, fullPage: false })
await browser.close()
console.log(`saved ${out}`)

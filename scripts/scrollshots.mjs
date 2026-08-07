// Dev-time helper: screenshot each landing section after scrolling to it.
import { chromium } from '@playwright/test'

const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
for (const id of ['about', 'work', 'misc', 'writing', 'contact']) {
  await page.evaluate((sel) => document.getElementById(sel)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/sec-${id}.png` })
  console.log(`saved sec-${id}.png`)
}
await browser.close()

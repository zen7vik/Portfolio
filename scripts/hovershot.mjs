// Dev-time helper: park the cursor off-center and capture the repulsion void.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
await page.mouse.move(1100, 250)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/hole-offcenter.png` })
console.log('saved hole-offcenter.png')
await browser.close()

// Dev-time helper: click a work card, capture mid-transition and destination.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)
await page.evaluate(() => document.getElementById('work')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1200)
await page.click('a[href="/work/workflow-platform"]')
await page.waitForTimeout(200)
await page.screenshot({ path: `${out}/trans-mid.png` })
await page.waitForTimeout(1800)
await page.screenshot({ path: `${out}/trans-after.png` })
console.log('url:', page.url())
await browser.close()

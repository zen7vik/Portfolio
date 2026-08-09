// Dev-time helper: capture all sections + case page at mobile size.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4500)
await page.screenshot({ path: `${out}/m-hero.png` })
for (const id of ['about', 'work', 'personal', 'writing', 'contact']) {
  await page.evaluate((s) => document.getElementById(s)?.scrollIntoView({ behavior: 'instant' }), id)
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${out}/m-${id}.png` })
}
await page.goto('http://localhost:3000/work/workflow-platform', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: `${out}/m-case.png` })
await page.evaluate(() => window.scrollTo(0, 1800))
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/m-case-scrolly.png` })
console.log('saved mobile audit shots')
await browser.close()

// Dev-time helper: capture about globe + expanded personal row.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2600)
await page.screenshot({ path: `${out}/r4-about.png` })
await page.evaluate(() => document.getElementById('personal')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2000)
await page.getByRole('button', { name: /Tessera/ }).click()
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/r4-personal.png` })
console.log('saved r4-about r4-personal')
await browser.close()

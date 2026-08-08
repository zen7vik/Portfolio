// Dev-time helper: land on hero, scroll to about, capture the portrait morph.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4500)
await page.screenshot({ path: `${out}/p-hero.png` })
await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2800)
await page.screenshot({ path: `${out}/p-about.png` })
await page.evaluate(() => document.getElementById('work')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2500)
await page.screenshot({ path: `${out}/p-work.png` })
console.log('saved p-hero p-about p-work')
await browser.close()

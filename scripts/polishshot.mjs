// Dev-time helper: verify footer status, cursor dot, reading progress mid-scroll.
import { chromium } from '@playwright/test'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)
await page.mouse.move(300, 700)
await page.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2000)
await page.screenshot({ path: `${out}/pol-contact.png` })
await page.goto('http://localhost:3000/work/risk-engine', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45))
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/pol-case.png` })
console.log('saved pol-contact pol-case')
await browser.close()

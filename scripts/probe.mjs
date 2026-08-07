// Dev-time probe: capture console + page errors while loading a route.
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 300)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 500)))
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
const probe = await page.evaluate(() => window.__scene ?? null).catch(() => null)
console.log('[probe]', JSON.stringify(probe))
await browser.close()

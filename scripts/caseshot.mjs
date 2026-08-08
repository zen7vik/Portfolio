// Dev-time helper: screenshot a case page at top and mid-scrollytelling.
import { chromium } from '@playwright/test'
const slug = process.argv[2] ?? 'workflow-platform'
const out = process.argv[3] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`http://localhost:3000/work/${slug}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
await page.screenshot({ path: `${out}/case-top.png` })
const y = await page.evaluate(() => {
  const el = document.querySelector('.scrolly-step:nth-of-type(3)')
  return el ? el.getBoundingClientRect().top + window.scrollY - 300 : 2000
})
await page.evaluate((v) => window.scrollTo(0, v), y)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/case-mid.png` })
console.log('saved case-top.png case-mid.png')
await browser.close()

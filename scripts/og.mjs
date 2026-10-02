// One-off: generate public/og.png (1200x630) from inline HTML.
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
await page.setContent(`
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@75..125,200..900&family=Geist+Mono&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0c0c0d; color: #eeeeec; font-family: 'Mona Sans', sans-serif;
    padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .who { font-size: 26px; color: #c2c2be; }
  h1 { font-size: 104px; line-height: 0.95; font-weight: 760; font-variation-settings: 'wdth' 118; letter-spacing: -0.035em; margin-top: 26px; }
  h1 span { color: #ff5d2e; }
  .stats { display: flex; border-top: 1px solid rgb(238 238 236 / 0.12); }
  .stat { flex: 1; padding-top: 26px; }
  .stat + .stat { border-left: 1px solid rgb(238 238 236 / 0.12); padding-left: 28px; }
  .v { font-size: 46px; font-weight: 760; font-variation-settings: 'wdth' 118; letter-spacing: -0.03em; }
  .l { font-size: 19px; color: #8d8d8a; margin-top: 6px; }
</style>
<div>
  <p class="who">Satvik Singh, fullstack AI engineer</p>
  <h1>I build systems<br>that stay <span>up.</span></h1>
</div>
<div class="stats">
  <div class="stat"><p class="v">72M</p><p class="l">risk calculations a month</p></div>
  <div class="stat"><p class="v">-53%</p><p class="l">p95 latency</p></div>
  <div class="stat"><p class="v">3.8%</p><p class="l">workflow failure rate</p></div>
</div>
`)
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await page.screenshot({ path: 'public/og.png' })
await browser.close()
console.log('saved public/og.png')

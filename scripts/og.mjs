// One-off: generate public/og.png (1200x630) from inline HTML.
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
await page.setContent(`
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0a0a0f; color: #e8e8ea;
    font-family: -apple-system, 'Helvetica Neue', sans-serif; padding: 80px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: radial-gradient(ellipse 70% 55% at 75% 30%, #171a30 0%, transparent 70%); }
  .dots { position: absolute; inset: 0; background-image: radial-gradient(#7c8cff22 1.5px, transparent 1.5px); background-size: 26px 26px; }
  h1 { font-size: 110px; font-weight: 800; letter-spacing: -4px; }
  h1 span { color: #7c8cff; }
  p.tag { font-size: 34px; color: #8a8a95; margin-top: 18px; }
  .stats { display: flex; gap: 16px; }
  .pill { border: 1.5px solid #33333d; border-radius: 99px; padding: 12px 24px; font-size: 22px;
    font-family: Menlo, monospace; color: #b8b8c0; }
  .pill b { color: #e8e8ea; }
</style>
<div class="dots"></div>
<div>
  <h1>Satvik Singh<span>.</span></h1>
  <p class="tag">Backend engineer. I build distributed systems that don't fall over.</p>
</div>
<div class="stats">
  <span class="pill"><b>500M</b> events/mo</span>
  <span class="pill"><b>p99 585ms</b></span>
  <span class="pill"><b>6</b> regions</span>
  <span class="pill"><b>147K</b> workflows/mo</span>
</div>
`)
await page.waitForTimeout(300)
await page.screenshot({ path: 'public/og.png' })
await browser.close()
console.log('saved public/og.png')

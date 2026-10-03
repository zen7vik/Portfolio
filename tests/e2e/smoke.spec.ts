import { expect, test } from '@playwright/test'

test('room loads and the loader clears', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Satvik Singh', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Brewing chai, waking the cat...')).toBeHidden({ timeout: 30_000 })
  await expect(page.getByText(/Found 0 of 16 things/)).toBeVisible()
})

test('read page has every section', async ({ page }) => {
  await page.goto('/read')
  for (const id of ['work', 'experience', 'projects', 'writing', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeAttached()
  }
})

test('all five case pages render with scrollytelling', async ({ page }) => {
  for (const slug of ['workflow-platform', 'risk-engine', 'temporal-migration', 'rag-pipeline', 'data-exchange']) {
    await page.goto(`/work/${slug}`)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'The problem' })).toBeVisible()
    await expect(page.locator('.scrolly-step').first()).toBeAttached()
  }
})

test('terminal opens, runs commands, navigates', async ({ page }) => {
  await page.goto('/read')
  await page.waitForTimeout(1000)
  await page.keyboard.press('`')
  const input = page.getByRole('textbox', { name: 'Terminal input' })
  await expect(input).toBeVisible()
  await input.fill('whoami')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Fullstack AI engineer: Go, TypeScript, distributed systems, AI pipelines')).toBeVisible()
  await input.fill('open risk-engine')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/work\/risk-engine/)
})

test('command palette navigates to a case study', async ({ page }) => {
  await page.goto('/read')
  await page.waitForTimeout(1000)
  await page.keyboard.press('ControlOrMeta+k')
  const input = page.getByRole('textbox', { name: 'Palette search' })
  await expect(input).toBeVisible()
  await input.fill('workflow')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/work\/workflow-platform/)
})

test('resume downloads as pdf', async ({ page }) => {
  await page.goto('/read')
  const dl = page.waitForEvent('download')
  await page.getByRole('link', { name: /resume/i }).first().click()
  expect((await dl).suggestedFilename()).toContain('.pdf')
})

test('404 page renders in theme', async ({ page }) => {
  await page.goto('/work/does-not-exist')
  await expect(page.getByText('This page is down. The rest is fine.')).toBeVisible()
})

test('read mode pages share a header and go back to the right section', async ({ page }) => {
  await page.goto('/work/risk-engine')
  await expect(page.getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/read#work')
  await page.goto('/writing/f3181cdeb970')
  await expect(page.getByRole('link', { name: 'All writing' })).toHaveAttribute('href', '/read#writing')
  await page.goto('/read')
  await expect(page.getByRole('button', { name: 'Toggle color theme' })).toBeVisible()
})

test('theme toggle flips read mode and is remembered', async ({ page }) => {
  await page.goto('/read')
  const before = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.getByRole('button', { name: 'Toggle color theme' }).click()
  const after = await page.evaluate(() => document.documentElement.dataset.theme)
  expect(after).not.toBe(before)
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after)
})

test('palette inside the room opens a case in the reader, not a new page', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1500)
  await page.keyboard.press('ControlOrMeta+k')
  await page.getByRole('textbox', { name: 'Palette search' }).fill('risk')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: /risk-scoring engine/i })).toBeVisible({ timeout: 10_000 })
  expect(new URL(page.url()).pathname).toBe('/')
})

test('on a phone, SatvikOS windows open from the desktop and close again', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/')
  await expect(page.getByText('Brewing chai, waking the cat...')).toBeHidden({ timeout: 30_000 })
  await page.mouse.click(195, 330)
  const work = page.getByRole('button', { name: 'Work', exact: true })
  if (!(await work.isVisible().catch(() => false))) test.skip(true, 'monitor not at this point in software rendering')
  await work.click()
  const close = page.getByRole('button', { name: 'Close window' })
  await expect(close).toHaveCount(1)
  await close.click()
  await expect(close).toHaveCount(0)
  await page.close()
})

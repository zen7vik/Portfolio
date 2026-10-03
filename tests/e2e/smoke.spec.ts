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

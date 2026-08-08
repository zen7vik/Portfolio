import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3100' },
  webServer: {
    command: 'npm run build && npx next start -p 3100',
    port: 3100,
    timeout: 180_000,
    reuseExistingServer: false,
  },
})

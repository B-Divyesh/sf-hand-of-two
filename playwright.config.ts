import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.ts/,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'VITE_REALTIME_ORIGIN=http://127.0.0.1:8788 npm run build && PORT=4173 DATA_DIR=.test-data-static PUBLIC_ORIGIN=http://127.0.0.1:4173 REALTIME_ORIGIN=http://127.0.0.1:8788 npm run start',
      url: 'http://127.0.0.1:4173/api/health',
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'PORT=8788 DATA_DIR=.test-data-realtime PUBLIC_ORIGIN=http://127.0.0.1:4173 npm run start',
      url: 'http://127.0.0.1:8788/api/health',
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});

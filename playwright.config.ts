import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '.env'),
  quiet: true,
});

export default defineConfig({
  testDir: './tests',
  name: 'carf',
  outputDir: './test-results',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.workers ? Number(process.env.workers) : '40%',
  reporter: [
    ["list"],
    ['html'],
    ["allure-playwright"]
  ],
  use: {
    trace: 'retain-on-failure-and-retries',
    baseURL: process.env.BASE_URL ?? '',
    video: 'retain-on-failure-and-retries',
    screenshot: 'only-on-failure',
    headless: process.env.headless ? process.env.headless !== 'false' : true,
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});

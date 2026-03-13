import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// This is to load the environment variables from the .env file.
dotenv.config();

// This is the main configuration file for Playwright.
// We're using it to configure the test runner and the browser(s) to use.
export default defineConfig({

  // Folder containing the actual test spec files
  testDir: './tests',

  // This is to run tests in parallel (saves time when running tests).
  fullyParallel: true,

  // This is to prevent tests from running only if CI is true. 
  // We don't need CI for this project, so it's set to false.
  forbidOnly: !!process.env.CI,

  // This is to retry tests if they fail.
  // We're setting it to 2 retries if CI is true, and 1 retry if CI is false.
  // In this case, we're not using CI, so when you run tests locally, it will only retry once.
  retries: process.env.CI ? 2 : 1,

  // This is to run tests on a single worker.
  workers: process.env.CI ? 1 : undefined,

  // Maximum time one test can run (default 30s). E2E against real site will need longer than this.
  timeout: 90_000,

  // This is to report the test results in an HTML file.
  reporter: 'html',

  // This is the base URL for the tests. The necessary endpoints are defined in the page object models.
  // "trace" is to save the trace of the test run, and
  // "screenshot" is to save a screenshot of the page if the test fails.
  use: {
    baseURL: 'https://qa-practice.netlify.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // This is to run the tests on a specific browser.
  // In this case, we're running the tests on Chrome.
  // Take note that in the README.md, I mentioned that we 
  // could set it to use all browsers by removing 'chromium' 
  // from the 'npx playwright install chromium' command.
  // If you decide to run on more browsers at any point, add them here
  // and then update the README.md accordingly. 
  // (See commented-out firefox project below as an example.)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});

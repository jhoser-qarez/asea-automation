import { defineConfig, devices } from "@playwright/test";
const isCI = !!process.env["CI"];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 120000,

  reporter: [
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-report",
      },
    ],
    ["list"],
    [
      "junit",
      {
        outputFile: "test-results/results.xml",
      },
    ],
  ],

  use: {
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    navigationTimeout: 80000,
  },

  projects: [
    // Navegadores base (sin metadata específica)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // ✅ Virtual Office sections - por entorno
    {
      name: "stage",
      use: { ...devices["Desktop Chrome"] },
      metadata: {
        env: "stage",
        voPort: undefined,
      },
      timeout: 180000,
    },

    {
      name: "live-port-1",
      use: { ...devices["Desktop Chrome"] },
      metadata: {
        env: "live",
        voPort: "10000",
      },
    },
    {
      name: "live-port-2",
      use: { ...devices["Desktop Chrome"] },
      metadata: {
        env: "live",
        voPort: "10001",
      },
    },
    {
      name: "live",
      use: { ...devices["Desktop Chrome"] },
      metadata: {
        env: "live",
        voPort: undefined,
      },
    },
  ],
});

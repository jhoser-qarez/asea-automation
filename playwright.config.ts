import { defineConfig, devices } from "@playwright/test";
const isCI = !!process.env["CI"];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 80000,

  reporter: [
    [
      "html",
      {
        open: "never", // no abre automáticamente al terminar
        outputFolder: "playwright-report",
      },
    ],
    ["list"], // ✅ muestra resultados en tiempo real en terminal
    [
      "junit",
      {
        outputFile: "test-results/results.xml", // ✅ útil para CI/CD
      },
    ],
  ],

  use: {
    baseURL: "https://shop.aseastage.com/",
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    navigationTimeout: 60000,
  },

  projects: [
    // ✅ Chrome
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // ✅ Firefox
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // ✅ Safari
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});

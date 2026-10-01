import { defineConfig, devices } from "@playwright/test";
const isCI = !!process.env["CI"];

// "viewport: null" no es compatible con "deviceScaleFactor", así que lo excluimos
// del preset para poder maximizar la ventana al tamaño real de la pantalla.
const { deviceScaleFactor: _chromeDsf, ...desktopChromeNoScale } =
  devices["Desktop Chrome"];

// ✅ Carpeta del reporte HTML por corrida — nunca se sobrescribe la
// anterior, para poder guardar/compartir el historial de reportes con el
// equipo. Los scripts ScriptRun-*.ps1 fijan REPORT_DIR con un nombre
// descriptivo (entorno + fecha); si se corre directo sin pasar por ellos,
// se genera una carpeta con timestamp igual de única.
const reportDir =
  process.env["REPORT_DIR"] ||
  `playwright-report/run-${new Date().toISOString().replace(/[:.]/g, "-")}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120000,

  reporter: [
    [
      "html",
      {
        open: "never",
        outputFolder: reportDir,
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
    // viewport: null + --start-maximized hace que la ventana ocupe toda la pantalla del dispositivo
    viewport: null,
    launchOptions: {
      args: ["--start-maximized"],
    },
  },

  projects: [
    // Navegadores base (sin metadata específica)
    {
      name: "chromium",
      use: { ...desktopChromeNoScale, viewport: null },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: null,
        launchOptions: { args: [] },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: null,
        launchOptions: { args: [] },
      },
    },

    // ✅ Virtual Office sections - por entorno
    {
      name: "stage",
      use: { ...desktopChromeNoScale, viewport: null },
      metadata: {
        env: "stage",
        voPort: undefined,
      },
      timeout: 180000,
    },

    {
      name: "live-port-1",
      use: { ...desktopChromeNoScale, viewport: null },
      metadata: {
        env: "live",
        voPort: "10000",
      },
    },
    {
      name: "live-port-2",
      use: { ...desktopChromeNoScale, viewport: null },
      metadata: {
        env: "live",
        voPort: "10001",
      },
    },
    {
      name: "live",
      use: { ...desktopChromeNoScale, viewport: null },
      metadata: {
        env: "live",
        voPort: undefined,
      },
    },
  ],
});

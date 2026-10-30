import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

/** Configuración común de Playwright. Cada app la extiende y elige sus proyectos. */
export const basePlaywrightConfig = defineConfig({
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  // En CI cada shard deja un blob; el job de reporte los une en un solo HTML.
  reporter: isCI
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }], ["blob"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});

/** Proyecto de las apps web. Las de API no lo usan, porque no abren navegador. */
export const desktopChromium = { name: "chromium", use: { ...devices["Desktop Chrome"] } };

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

// Emulación móvil: la página web con la pantalla, el toque y el navegador de cada teléfono.
// No prueba una app nativa; esas están en apps/my-demo-app-e2e.
export const pixel7 = { name: "pixel-7", use: { ...devices["Pixel 7"] } };
// Con 8 instancias de WebKit a la vez, en macOS, algunos clics se quedan esperando hasta el
// timeout; con 2 no pasa. Es el mismo número de workers que en CI.
export const iphone15 = { name: "iphone-15", workers: 2, use: { ...devices["iPhone 15"] } };

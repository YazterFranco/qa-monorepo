import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);

// Pruebas de capas: ninguna usa la fixture page, así que no se abre navegador.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.test.ts",
  forbidOnly: isCI,
  reporter: isCI
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }], ["blob"]]
    : "list",
});

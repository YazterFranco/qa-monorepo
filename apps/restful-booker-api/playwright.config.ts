import { defineConfig } from "@playwright/test";
import { basePlaywrightConfig } from "utils";

// Pruebas de API: usan la fixture request y no abren navegador.
// La baseURL sale del ambiente de TEST_ENV, en fixtures/restful-booker.
export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  projects: [{ name: "api" }],
  use: { extraHTTPHeaders: { Accept: "application/json" } },
});

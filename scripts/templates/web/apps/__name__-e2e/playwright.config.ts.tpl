import { defineConfig } from "@playwright/test";
import { basePlaywrightConfig, desktopChromium } from "utils";

// La baseURL sale del ambiente de TEST_ENV, en fixtures/[[name]].
// Para probar también en tamaño de teléfono, suma pixel7 e iphone15, que vienen de "utils".
export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  projects: [desktopChromium],
});

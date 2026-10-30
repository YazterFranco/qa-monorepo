import { defineConfig } from "@playwright/test";
import { basePlaywrightConfig, desktopChromium } from "utils";

// La baseURL sale del ambiente de TEST_ENV, en fixtures/the-internet.
export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  projects: [desktopChromium],
});

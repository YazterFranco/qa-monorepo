import { defineConfig } from "@playwright/test";
import { basePlaywrightConfig, desktopChromium, iphone15, pixel7 } from "utils";

// La baseURL sale del ambiente de TEST_ENV, en fixtures/saucedemo.
export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  projects: [desktopChromium, pixel7, iphone15],
  // Sauce Demo marca sus elementos con data-test; así getByTestId los encuentra.
  use: { testIdAttribute: "data-test" },
});

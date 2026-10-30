import { defineConfig } from "@playwright/test";
import { loadEnvironment } from "test-data";
import { basePlaywrightConfig } from "utils";

const env = loadEnvironment();

export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  use: { baseURL: env.baseUrl },
});

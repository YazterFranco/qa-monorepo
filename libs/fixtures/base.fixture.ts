import { test as base, expect } from "@playwright/test";
import { loadEnvironment, type Environment } from "test-data";

export interface ProductWorkerFixtures {
  env: Environment;
}

/**
 * Test base de un producto: carga sus datos del ambiente de TEST_ENV una vez por worker
 * y usa su baseUrl como baseURL de Playwright.
 */
export function productTest(product: string) {
  return base.extend<object, ProductWorkerFixtures>({
    env: [
      async ({}, use) => {
        await use(loadEnvironment(product));
      },
      { scope: "worker" },
    ],
    baseURL: async ({ env }, use) => {
      if (!env.baseUrl) {
        throw new Error(`El ambiente de "${product}" no tiene baseUrl.`);
      }
      await use(env.baseUrl);
    },
  });
}

export { expect };

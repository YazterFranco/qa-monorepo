import { test as base, expect } from "@playwright/test";
import { AuthSteps } from "steps";
import { loadEnvironment, type Environment } from "test-data";

interface TestFixtures {
  auth: AuthSteps;
}

interface WorkerFixtures {
  env: Environment;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Se carga una vez por worker; el ambiente sale de TEST_ENV.
  env: [
    async ({}, use) => {
      await use(loadEnvironment());
    },
    { scope: "worker" },
  ],
  auth: async ({ page, env }, use) => {
    await use(new AuthSteps(page, env));
  },
});

export { expect };

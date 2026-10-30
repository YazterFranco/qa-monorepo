import { AuthSteps } from "steps/the-internet";
import { expect, productTest } from "../base.fixture";

interface TestFixtures {
  auth: AuthSteps;
}

export const test = productTest("the-internet").extend<TestFixtures>({
  auth: async ({ page, env }, use) => {
    await use(new AuthSteps(page, env));
  },
});

export { expect };

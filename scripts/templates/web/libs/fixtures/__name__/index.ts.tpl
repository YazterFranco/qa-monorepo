import { AuthSteps } from "steps/[[name]]";
import { expect, productTest } from "../base.fixture";

interface TestFixtures {
  auth: AuthSteps;
}

export const test = productTest("[[name]]").extend<TestFixtures>({
  auth: async ({ page, env }, use) => {
    await use(new AuthSteps(page, env));
  },
});

export { expect };

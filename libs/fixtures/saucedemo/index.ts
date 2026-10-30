import { AuthSteps, CartSteps, CheckoutSteps } from "steps/saucedemo";
import { expect, productTest } from "../base.fixture";

interface TestFixtures {
  auth: AuthSteps;
  cart: CartSteps;
  checkout: CheckoutSteps;
}

export const test = productTest("saucedemo").extend<TestFixtures>({
  auth: async ({ page, env }, use) => {
    await use(new AuthSteps(page, env));
  },
  cart: async ({ page }, use) => {
    await use(new CartSteps(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutSteps(page));
  },
});

export { expect };

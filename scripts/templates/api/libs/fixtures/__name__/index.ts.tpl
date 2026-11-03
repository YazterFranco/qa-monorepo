import { StatusClient } from "api/[[name]]";
import { expect, productTest } from "../base.fixture";

interface TestFixtures {
  statusApi: StatusClient;
}

// Solo usa `request`: ningún test de este producto abre un navegador.
export const test = productTest("[[name]]").extend<TestFixtures>({
  statusApi: async ({ request }, use) => {
    await use(new StatusClient(request));
  },
});

export { expect };

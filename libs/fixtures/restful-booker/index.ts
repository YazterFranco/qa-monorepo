import { AuthClient, BookingClient } from "api/restful-booker";
import { AuthSteps, BookingSteps } from "steps/restful-booker";
import { expect, productTest } from "../base.fixture";

interface TestFixtures {
  authApi: AuthClient;
  bookingApi: BookingClient;
  auth: AuthSteps;
  bookings: BookingSteps;
}

// Solo usa `request`: ningún test de este producto abre un navegador.
export const test = productTest("restful-booker").extend<TestFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  bookingApi: async ({ request }, use) => {
    await use(new BookingClient(request));
  },
  auth: async ({ request, env }, use) => {
    await use(new AuthSteps(request, env));
  },
  bookings: async ({ request }, use) => {
    await use(new BookingSteps(request));
  },
});

export { expect };

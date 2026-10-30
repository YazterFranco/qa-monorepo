import { expect, test } from "@playwright/test";
import { AuthSteps } from "steps/restful-booker";
import type { Environment } from "test-data";
import { createFakeRequest } from "../../support/fake-request";

const environment: Environment = {
  baseUrl: "https://example.test",
  users: { admin: { username: "admin", password: "clave-de-prueba" } },
  messages: {},
  customers: {},
  products: {},
  bookings: {},
};

test.describe("steps: AuthSteps de restful-booker", () => {
  test("tokenFor manda las credenciales del rol y devuelve el token", async () => {
    const { request, calls } = createFakeRequest({ "POST /auth": { body: { token: "abc123" } } });

    const token = await new AuthSteps(request, environment).tokenFor("admin");

    expect(token).toBe("abc123");
    expect(calls[0]?.options.data).toEqual(environment.users.admin);
  });

  test("tokenFor falla con el motivo cuando la API rechaza las credenciales", async () => {
    const { request } = createFakeRequest({
      "POST /auth": { body: { reason: "Bad credentials" } },
    });

    await expect(new AuthSteps(request, environment).tokenFor("admin")).rejects.toThrow(
      'La API no dio token para "admin": Bad credentials.',
    );
  });
});

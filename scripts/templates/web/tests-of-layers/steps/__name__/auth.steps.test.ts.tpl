import { expect, test } from "@playwright/test";
import { AuthSteps } from "steps/[[name]]";
import type { Environment } from "test-data";
import { createFakePage } from "../../support/fake-page";

const environment: Environment = {
  baseUrl: "https://example.test",
  users: { standard: { username: "ana", password: "clave-de-prueba" } },
  messages: {},
  customers: {},
  products: {},
  bookings: {},
};

test.describe("steps: AuthSteps de [[name]]", () => {
  test("loginAs abre el login y entra con el usuario del rol", async () => {
    const { page, actions } = createFakePage();

    await new AuthSteps(page, environment).loginAs("standard");

    expect(actions[0]).toMatch(/^goto /);
    expect(actions.some((action) => action.endsWith("= ana"))).toBe(true);
    expect(actions.some((action) => action.endsWith("= clave-de-prueba"))).toBe(true);
  });

  test("loginAs falla con los roles disponibles si el rol no existe", async () => {
    const { page } = createFakePage();

    await expect(new AuthSteps(page, environment).loginAs("root")).rejects.toThrow(
      'El ambiente no tiene un usuario con rol "root". Roles disponibles: standard.',
    );
  });
});

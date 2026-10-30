import { expect, test } from "@playwright/test";
import { AuthSteps } from "steps";
import type { Environment } from "test-data";
import { createFakePage } from "../support/fake-page";

const environment: Environment = {
  baseUrl: "https://example.test",
  users: { standard: { username: "ana", password: "clave-de-prueba" } },
  messages: {},
};

test.describe("steps: AuthSteps", () => {
  test("loginAs abre el login y usa las credenciales del rol", async () => {
    const { page, actions } = createFakePage();

    await new AuthSteps(page, environment).loginAs("standard");

    expect(actions).toEqual([
      "goto /login",
      'fill label "Username" = ana',
      'fill label "Password" = clave-de-prueba',
      'click button "Login"',
    ]);
  });

  test("loginAs falla con un rol que no existe y lista los disponibles", async () => {
    const { page, actions } = createFakePage();

    await expect(new AuthSteps(page, environment).loginAs("admin")).rejects.toThrow(
      'El ambiente no tiene un usuario con rol "admin". Roles disponibles: standard.',
    );
    expect(actions).toEqual([]);
  });
});

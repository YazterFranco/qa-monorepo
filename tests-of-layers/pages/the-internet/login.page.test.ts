import { expect, test } from "@playwright/test";
import { LoginPage } from "pages/the-internet";
import { createFakePage } from "../../support/fake-page";

test.describe("pages: LoginPage", () => {
  test("goto abre /login relativo a la baseURL", async () => {
    const { page, actions } = createFakePage();

    await new LoginPage(page).goto();

    expect(actions).toEqual(["goto /login"]);
  });

  test("login llena usuario y contraseña y envía, en ese orden", async () => {
    const { page, actions } = createFakePage();

    await new LoginPage(page).login("ana", "clave-de-prueba");

    expect(actions).toEqual([
      'fill label "Username" = ana',
      'fill label "Password" = clave-de-prueba',
      'click button "Login"',
    ]);
  });

  test("getFlashMessage devuelve el texto del aviso sin espacios extra", async () => {
    const { page } = createFakePage();

    await expect(new LoginPage(page).getFlashMessage()).resolves.toBe("texto de [data-alert]");
  });
});

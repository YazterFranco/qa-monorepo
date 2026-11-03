import { expect, test } from "@playwright/test";
import { LoginPage } from "pages/[[name]]";
import { createFakePage } from "../../support/fake-page";

// No fija selectores a propósito: cambian cuando adaptas la pantalla. Comprueba el orden de las
// acciones, que es lo que no debe romperse.
test.describe("pages: LoginPage de [[name]]", () => {
  test("goto abre una ruta relativa a la baseURL", async () => {
    const { page, actions } = createFakePage();

    await new LoginPage(page).goto();

    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatch(/^goto \//);
  });

  test("login llena usuario y contraseña y envía, en ese orden", async () => {
    const { page, actions } = createFakePage();

    await new LoginPage(page).login("ana", "clave-de-prueba");

    expect(actions.map((action) => action.split(" ")[0])).toEqual(["fill", "fill", "click"]);
    expect(actions[0]).toMatch(/= ana$/);
    expect(actions[1]).toMatch(/= clave-de-prueba$/);
  });
});

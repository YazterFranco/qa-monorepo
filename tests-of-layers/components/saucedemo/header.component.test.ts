import { expect, test } from "@playwright/test";
import { Header } from "components/saucedemo";
import { createFakePage } from "../../support/fake-page";

test.describe("components: Header de saucedemo", () => {
  test("busca sus elementos dentro del contenedor que recibe", async () => {
    const { page, actions } = createFakePage();

    await new Header(page.getByTestId("header-container")).openCart();

    expect(actions).toEqual(['click testid "header-container" > testid "shopping-cart-link"']);
  });

  test("logout abre el menú y luego elige Logout", async () => {
    const { page, actions } = createFakePage();

    await new Header(page.getByTestId("header-container")).logout();

    expect(actions).toEqual([
      'click testid "header-container" > button "Open Menu"',
      'click testid "header-container" > testid "logout-sidebar-link"',
    ]);
  });
});

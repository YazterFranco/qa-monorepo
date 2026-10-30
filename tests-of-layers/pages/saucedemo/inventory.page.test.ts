import { expect, test } from "@playwright/test";
import { InventoryPage } from "pages/saucedemo";
import { createFakePage } from "../../support/fake-page";

test.describe("pages: InventoryPage de saucedemo", () => {
  test("arma el data-test del botón a partir del nombre del producto", async () => {
    const { page, actions } = createFakePage();
    const inventory = new InventoryPage(page);

    await inventory.addToCart("Sauce Labs Backpack");
    await inventory.removeFromCart("Test.allTheThings() T-Shirt (Red)");

    expect(actions).toEqual([
      'click testid "add-to-cart-sauce-labs-backpack"',
      'click testid "remove-test.allthethings()-t-shirt-(red)"',
    ]);
  });

  test("sortBy elige la opción por su texto", async () => {
    const { page, actions } = createFakePage();

    await new InventoryPage(page).sortBy("Price (low to high)");

    expect(actions).toEqual(['select testid "product-sort-container" = Price (low to high)']);
  });

  test("getPrices convierte los precios a números", async () => {
    const { page } = createFakePage({ 'testid "inventory-item-price"': ["$29.99", "$7.99"] });

    await expect(new InventoryPage(page).getPrices()).resolves.toEqual([29.99, 7.99]);
  });
});

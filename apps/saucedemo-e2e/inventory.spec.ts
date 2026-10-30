import { expect, test } from "fixtures/saucedemo";
import { InventoryPage } from "pages/saucedemo";

// problem_user y error_user tienen el orden roto a propósito. test.fail los marca como
// fallas esperadas: si un día pasan, el reporte avisa que el bug se arregló.
const sortScenarios = [
  { scenario: "usuario estándar", role: "standard", knownBug: false },
  { scenario: "problem_user", role: "problem", knownBug: true },
  { scenario: "error_user", role: "error", knownBug: true },
];

for (const { scenario, role, knownBug } of sortScenarios) {
  test(`${scenario}: ordena por precio de menor a mayor`, async ({ auth, env, page }) => {
    test.fail(knownBug, "Bug conocido de Sauce Demo: el orden no cambia");
    await auth.loginAs(role);

    const inventory = new InventoryPage(page);
    await inventory.sortBy("Price (low to high)");

    const expectedPrices = Object.values(env.products)
      .map((product) => product.price)
      .sort((a, b) => a - b)
      .map((price) => `$${price.toFixed(2)}`);
    await expect(inventory.itemPrices).toHaveText(expectedPrices);
  });
}

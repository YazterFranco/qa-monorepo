import { expect, test } from "@playwright/test";
import { CartSteps, CheckoutSteps } from "steps/saucedemo";
import { createFakePage } from "../../support/fake-page";

const customer = { firstName: "Ana", lastName: "Pérez", postalCode: "28001" };
const backpack = { name: "Sauce Labs Backpack", price: 29.99 };
const bikeLight = { name: "Sauce Labs Bike Light", price: 9.99 };

test.describe("steps: CartSteps de saucedemo", () => {
  test("add agrega cada producto en el orden recibido", async () => {
    const { page, actions } = createFakePage();

    await new CartSteps(page).add(backpack, bikeLight);

    expect(actions).toEqual([
      'click testid "add-to-cart-sauce-labs-backpack"',
      'click testid "add-to-cart-sauce-labs-bike-light"',
    ]);
  });
});

test.describe("steps: CheckoutSteps de saucedemo", () => {
  test("completeOrder va del carrito a la confirmación con los datos del cliente", async () => {
    const { page, actions } = createFakePage();

    await new CheckoutSteps(page).completeOrder(customer);

    expect(actions).toEqual([
      'click testid "header-container" > testid "shopping-cart-link"',
      'click testid "checkout"',
      'fill testid "firstName" = Ana',
      'fill testid "lastName" = Pérez',
      'fill testid "postalCode" = 28001',
      'click testid "continue"',
      'click testid "finish"',
    ]);
  });

  test("enterCustomerInfo se detiene antes de confirmar la compra", async () => {
    const { page, actions } = createFakePage();

    await new CheckoutSteps(page).enterCustomerInfo({ ...customer, lastName: "" });

    expect(actions).toContain('fill testid "lastName" = ');
    expect(actions.at(-1)).toBe('click testid "continue"');
  });
});

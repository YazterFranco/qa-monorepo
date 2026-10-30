import { expect, test } from "fixtures/saucedemo";
import { CheckoutCompletePage, CheckoutInfoPage } from "pages/saucedemo";

test("compra completa de un producto", async ({ auth, cart, checkout, env, page }) => {
  await auth.loginAs("standard");
  await cart.add(env.products.backpack);

  await checkout.completeOrder(env.customers.standard);

  await expect(new CheckoutCompletePage(page).confirmationTitle).toHaveText(
    env.messages.orderComplete,
  );
});

const missingFields = [
  { scenario: "nombre", field: "firstName", message: "firstNameRequired" },
  { scenario: "apellido", field: "lastName", message: "lastNameRequired" },
  { scenario: "código postal", field: "postalCode", message: "postalCodeRequired" },
] as const;

for (const { scenario, field, message } of missingFields) {
  test(`sin ${scenario} no avanza y lo pide`, async ({ auth, cart, checkout, env, page }) => {
    await auth.loginAs("standard");
    await cart.add(env.products.backpack);

    await checkout.enterCustomerInfo({ ...env.customers.standard, [field]: "" });

    await expect(new CheckoutInfoPage(page).errorMessage).toHaveText(env.messages[message]);
  });
}

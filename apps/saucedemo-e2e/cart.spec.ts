import { expect, test } from "fixtures/saucedemo";
import { CartPage, InventoryPage } from "pages/saucedemo";

test("agregar y quitar productos actualiza el carrito", async ({ auth, cart, env, page }) => {
  await auth.loginAs("standard");
  const inventory = new InventoryPage(page);

  await cart.add(env.products.backpack, env.products.bikeLight);
  await expect(inventory.header.cartBadge).toHaveText("2");

  await cart.remove(env.products.bikeLight);
  await expect(inventory.header.cartBadge).toHaveText("1");

  await cart.open();
  await expect(new CartPage(page).itemNames).toHaveText([env.products.backpack.name]);
});

test("problem_user: algunos productos no se agregan", async ({ auth, cart, env, page }) => {
  test.fail(true, "Bug conocido de Sauce Demo: con problem_user algunos botones no hacen nada");
  await auth.loginAs("problem");

  await cart.add(env.products.boltTShirt);

  await expect(new InventoryPage(page).header.cartBadge).toHaveText("1");
});

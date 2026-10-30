import { driver, expect } from "@wdio/globals";
import { myDemoApp } from "fixtures/my-demo-app";
import { CartScreen, ProductScreen } from "pages/my-demo-app";

describe("carrito", () => {
  const { env, cart, restartApp } = myDemoApp(driver);

  beforeEach(async () => {
    await restartApp();
  });

  it("agregar un producto actualiza el contador y el carrito", async () => {
    await cart.add(env.products.backpack);
    await expect(new ProductScreen(driver).header.cartCount).toHaveText("1");

    await cart.open();

    const cartScreen = new CartScreen(driver);
    await expect(cartScreen.title).toHaveText(env.messages.cartTitle);
    await expect(cartScreen.productNames).toHaveText([env.products.backpack.name]);
  });

  it("quitar el producto vacía el carrito", async () => {
    await cart.add(env.products.backpack);
    await cart.open();

    await new CartScreen(driver).removeFirstItem();

    await expect(new ProductScreen(driver).header.cartCount).not.toBeDisplayed();
  });
});

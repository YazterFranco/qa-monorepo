import type { Browser } from "webdriverio";
import { androidId } from "./android-id";

/** Barra superior con el menú y el carrito. Aparece en el catálogo, el detalle y el carrito. */
export class Header {
  constructor(private readonly driver: Browser) {}

  get menuButton() {
    return this.driver.$("~View menu");
  }

  get loginMenuItem() {
    return this.driver.$("~Login Menu Item");
  }

  get cartButton() {
    return this.driver.$("~View cart");
  }

  /** Solo existe cuando hay productos en el carrito. */
  get cartCount() {
    return this.driver.$(androidId("cartTV"));
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async goToLogin(): Promise<void> {
    await this.openMenu();
    await this.loginMenuItem.click();
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
  }
}

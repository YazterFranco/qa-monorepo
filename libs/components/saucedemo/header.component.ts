import type { Locator } from "@playwright/test";

/** Encabezado con el carrito y el menú lateral. Aparece en el inventario, el carrito y el checkout. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(root: Locator) {
    this.cartLink = root.getByTestId("shopping-cart-link");
    this.cartBadge = root.getByTestId("shopping-cart-badge");
    // data-test="open-menu" está en el ícono, debajo del botón real que recibe el clic.
    this.menuButton = root.getByRole("button", { name: "Open Menu" });
    this.logoutLink = root.getByTestId("logout-sidebar-link");
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}

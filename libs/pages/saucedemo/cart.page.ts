import type { Locator, Page } from "@playwright/test";
import { Header } from "components/saucedemo";

export class CartPage {
  readonly header: Header;
  readonly itemNames: Locator;
  private readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page.getByTestId("header-container"));
    this.itemNames = page.getByTestId("inventory-item-name");
    this.checkoutButton = page.getByTestId("checkout");
  }

  async goto(): Promise<void> {
    await this.page.goto("/cart.html");
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}

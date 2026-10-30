import type { Locator, Page } from "@playwright/test";
import { Header } from "components/saucedemo";

export type SortOption =
  "Name (A to Z)" | "Name (Z to A)" | "Price (low to high)" | "Price (high to low)";

export class InventoryPage {
  readonly header: Header;
  readonly title: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  private readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page.getByTestId("header-container"));
    this.title = page.getByTestId("title");
    this.itemNames = page.getByTestId("inventory-item-name");
    this.itemPrices = page.getByTestId("inventory-item-price");
    this.sortSelect = page.getByTestId("product-sort-container");
  }

  async goto(): Promise<void> {
    await this.page.goto("/inventory.html");
  }

  addToCartButton(productName: string): Locator {
    return this.page.getByTestId(productTestId("add-to-cart", productName));
  }

  removeButton(productName: string): Locator {
    return this.page.getByTestId(productTestId("remove", productName));
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allInnerTexts();
    return texts.map((text) => Number(text.replace("$", "")));
  }
}

/** La app arma el data-test del botón con la acción y el nombre: "add-to-cart-sauce-labs-backpack". */
function productTestId(action: string, productName: string): string {
  return `${action}-${productName}`.replace(/\s+/g, "-").toLowerCase();
}

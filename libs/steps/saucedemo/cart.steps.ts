import type { Page } from "@playwright/test";
import { InventoryPage } from "pages/saucedemo";
import type { Product } from "test-data";

/** Acciones del carrito desde el inventario. */
export class CartSteps {
  constructor(private readonly page: Page) {}

  async add(...products: Product[]): Promise<void> {
    const inventory = new InventoryPage(this.page);
    for (const product of products) {
      await inventory.addToCart(product.name);
    }
  }

  async remove(...products: Product[]): Promise<void> {
    const inventory = new InventoryPage(this.page);
    for (const product of products) {
      await inventory.removeFromCart(product.name);
    }
  }

  async open(): Promise<void> {
    await new InventoryPage(this.page).header.openCart();
  }
}

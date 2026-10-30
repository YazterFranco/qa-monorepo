import type { Page } from "@playwright/test";
import { CartPage, CheckoutInfoPage, CheckoutOverviewPage, InventoryPage } from "pages/saucedemo";
import type { Customer } from "test-data";

/** Checkout desde el inventario, con productos ya en el carrito. */
export class CheckoutSteps {
  constructor(private readonly page: Page) {}

  /** Abre el carrito, inicia el checkout y envía los datos del cliente. */
  async enterCustomerInfo(customer: Customer): Promise<void> {
    await new InventoryPage(this.page).header.openCart();
    await new CartPage(this.page).checkout();

    const info = new CheckoutInfoPage(this.page);
    await info.fill(customer);
    await info.submit();
  }

  async completeOrder(customer: Customer): Promise<void> {
    await this.enterCustomerInfo(customer);
    await new CheckoutOverviewPage(this.page).finish();
  }
}

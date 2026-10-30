import type { Locator, Page } from "@playwright/test";

export class CheckoutOverviewPage {
  readonly itemNames: Locator;
  readonly totalLabel: Locator;
  private readonly finishButton: Locator;

  constructor(page: Page) {
    this.itemNames = page.getByTestId("inventory-item-name");
    this.totalLabel = page.getByTestId("total-label");
    this.finishButton = page.getByTestId("finish");
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}

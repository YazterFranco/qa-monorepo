import type { Locator, Page } from "@playwright/test";

export class CheckoutCompletePage {
  readonly confirmationTitle: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.confirmationTitle = page.getByTestId("complete-header");
    this.backHomeButton = page.getByTestId("back-to-products");
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}

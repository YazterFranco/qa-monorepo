import type { Locator, Page } from "@playwright/test";

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutInfoPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly errorMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.firstNameInput = page.getByTestId("firstName");
    this.lastNameInput = page.getByTestId("lastName");
    this.postalCodeInput = page.getByTestId("postalCode");
    this.errorMessage = page.getByTestId("error");
    this.continueButton = page.getByTestId("continue");
  }

  async fill({ firstName, lastName, postalCode }: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }
}

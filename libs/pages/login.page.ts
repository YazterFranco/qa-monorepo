import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly flashMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    // La demo no tiene data-testid ni rol en el aviso; data-alert es su atributo de alerta.
    this.flashMessage = page.locator("[data-alert]");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  async getFlashMessage(): Promise<string> {
    return (await this.flashMessage.innerText()).trim();
  }
}

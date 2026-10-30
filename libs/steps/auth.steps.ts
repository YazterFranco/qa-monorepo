import type { Page } from "@playwright/test";
import { LoginPage } from "pages";
import type { Environment } from "test-data";

export class AuthSteps {
  constructor(
    private readonly page: Page,
    private readonly environment: Environment,
  ) {}

  /** Inicia sesión con el usuario del rol indicado en el ambiente cargado. */
  async loginAs(role: string): Promise<void> {
    const user = this.environment.users[role];
    if (!user) {
      const roles = Object.keys(this.environment.users).join(", ");
      throw new Error(
        `El ambiente no tiene un usuario con rol "${role}". Roles disponibles: ${roles}.`,
      );
    }

    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(user.username, user.password);
  }
}

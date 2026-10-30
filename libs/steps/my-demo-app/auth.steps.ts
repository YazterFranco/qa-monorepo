import { CompatibilityDialog } from "components/my-demo-app";
import { CatalogScreen, LoginScreen } from "pages/my-demo-app";
import type { Environment } from "test-data";
import type { Browser } from "webdriverio";

export class AuthSteps {
  constructor(
    private readonly driver: Browser,
    private readonly environment: Environment,
  ) {}

  /** Abre el login desde el menú y espera a que esté listo. */
  async openLogin(): Promise<void> {
    await new CatalogScreen(this.driver).header.goToLogin();
    await new CompatibilityDialog(this.driver).dismissWhileWaitingFor(
      new LoginScreen(this.driver).loginButton,
    );
  }

  /** Entra con el usuario del rol indicado. */
  async loginAs(role: string): Promise<void> {
    const user = this.environment.users[role];
    if (!user) {
      const roles = Object.keys(this.environment.users).join(", ");
      throw new Error(
        `El ambiente no tiene un usuario con rol "${role}". Roles disponibles: ${roles}.`,
      );
    }

    await this.openLogin();
    await new LoginScreen(this.driver).login(user.username, user.password);
  }
}

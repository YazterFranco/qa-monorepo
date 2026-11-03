import { LoginScreen } from "pages/[[name]]";
import type { Environment } from "test-data";
import type { Browser } from "webdriverio";

export class AuthSteps {
  constructor(
    private readonly driver: Browser,
    private readonly environment: Environment,
  ) {}

  /**
   * Entra con el usuario del rol indicado. Supone que la app abre en el login; si tu app
   * llega a él por un menú u otro paso, agrégalo aquí.
   */
  async loginAs(role: string): Promise<void> {
    const user = this.environment.users[role];
    if (!user) {
      const roles = Object.keys(this.environment.users).join(", ");
      throw new Error(
        `El ambiente no tiene un usuario con rol "${role}". Roles disponibles: ${roles}.`,
      );
    }

    await new LoginScreen(this.driver).login(user.username, user.password);
  }
}

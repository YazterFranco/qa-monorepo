import { androidId } from "components/[[name]]";
import type { Browser } from "webdriverio";

/** Pantalla de login. Ajusta los selectores a tu app (Appium Inspector los muestra). */
export class LoginScreen {
  constructor(private readonly driver: Browser) {}

  get usernameInput() {
    return this.driver.$(androidId("username"));
  }

  get passwordInput() {
    return this.driver.$(androidId("password"));
  }

  get loginButton() {
    return this.driver.$(androidId("login_button"));
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.setValue(username);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }
}

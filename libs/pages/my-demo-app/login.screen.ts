import { androidId } from "components/my-demo-app";
import type { Browser } from "webdriverio";

export class LoginScreen {
  constructor(private readonly driver: Browser) {}

  get usernameInput() {
    return this.driver.$(androidId("nameET"));
  }

  get passwordInput() {
    return this.driver.$(androidId("passwordET"));
  }

  get loginButton() {
    return this.driver.$("~Tap to login with given credentials");
  }

  get usernameError() {
    return this.driver.$(androidId("nameErrorTV"));
  }

  /** La app muestra aquí también el error de usuario bloqueado. */
  get passwordError() {
    return this.driver.$(androidId("passwordErrorTV"));
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.setValue(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.setValue(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}

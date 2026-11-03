import { androidId } from "components/[[name]]";
import type { Browser } from "webdriverio";

/** Lo primero que ve la persona al iniciar sesión. Ajusta el selector a tu app. */
export class HomeScreen {
  constructor(private readonly driver: Browser) {}

  get title() {
    return this.driver.$(androidId("title"));
  }
}

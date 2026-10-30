import { androidId, Header } from "components/my-demo-app";
import type { Browser } from "webdriverio";

export class CartScreen {
  readonly header: Header;

  constructor(private readonly driver: Browser) {
    this.header = new Header(driver);
  }

  get title() {
    return this.driver.$(androidId("productTV"));
  }

  get productNames() {
    return this.driver.$$(androidId("titleTV"));
  }

  get removeButton() {
    return this.driver.$("~Removes product from cart");
  }

  async removeFirstItem(): Promise<void> {
    await this.removeButton.click();
  }
}

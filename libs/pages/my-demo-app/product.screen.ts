import { androidId, Header } from "components/my-demo-app";
import type { Browser } from "webdriverio";

export class ProductScreen {
  readonly header: Header;

  constructor(private readonly driver: Browser) {
    this.header = new Header(driver);
  }

  get name() {
    return this.driver.$(androidId("productTV"));
  }

  get price() {
    return this.driver.$(androidId("priceTV"));
  }

  get addToCartButton() {
    return this.driver.$("~Tap to add product to cart");
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}

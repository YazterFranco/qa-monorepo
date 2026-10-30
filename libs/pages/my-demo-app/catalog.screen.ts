import { androidId, Header } from "components/my-demo-app";
import type { Browser } from "webdriverio";

export class CatalogScreen {
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

  /** La imagen es lo que abre el detalle; se ubica por el nombre que tiene al lado. */
  productImage(productName: string) {
    return this.driver.$(
      `//*[@resource-id="${idOf("titleTV")}" and @text="${productName}"]` +
        `/../*[@resource-id="${idOf("productIV")}"]`,
    );
  }

  async openProduct(productName: string): Promise<void> {
    await this.productImage(productName).click();
  }
}

function idOf(id: string): string {
  return androidId(id).replace(/^id=/, "");
}

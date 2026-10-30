import { CatalogScreen, ProductScreen } from "pages/my-demo-app";
import type { Product } from "test-data";
import type { Browser } from "webdriverio";

/** Acciones del carrito desde el catálogo. */
export class CartSteps {
  constructor(private readonly driver: Browser) {}

  /** Abre el detalle del producto y lo agrega. Queda en la pantalla del detalle. */
  async add(product: Product): Promise<void> {
    await new CatalogScreen(this.driver).openProduct(product.name);
    await new ProductScreen(this.driver).addToCart();
  }

  async open(): Promise<void> {
    await new ProductScreen(this.driver).header.openCart();
  }
}

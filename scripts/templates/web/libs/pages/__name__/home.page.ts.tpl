import type { Locator, Page } from "@playwright/test";

/** Lo primero que ve la persona al iniciar sesión. Ajusta el selector a tu aplicación. */
export class HomePage {
  readonly heading: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole("heading", { level: 1 });
  }
}

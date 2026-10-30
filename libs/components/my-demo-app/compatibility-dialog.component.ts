import type { Browser, ChainablePromiseElement } from "webdriverio";

/**
 * Aviso de Android "This app isn't 16 KB compatible". Sale en emuladores con páginas de 16 KB
 * al abrir una pantalla nueva, varios segundos después y sin aviso previo. Borrar los datos de
 * la app lo vuelve a activar.
 */
export class CompatibilityDialog {
  constructor(private readonly driver: Browser) {}

  get dontShowAgainButton() {
    return this.driver.$("id=android:id/button1");
  }

  /** Espera a que aparezca `target`; si antes sale el aviso, elige "Don't Show Again". */
  async dismissWhileWaitingFor(target: ChainablePromiseElement, timeout = 30_000): Promise<void> {
    await this.driver.waitUntil(
      async () => {
        if (await this.dontShowAgainButton.isDisplayed()) {
          await this.dontShowAgainButton.click();
          return false;
        }
        return target.isDisplayed();
      },
      { timeout, interval: 500, timeoutMsg: "La pantalla esperada no apareció." },
    );
  }
}

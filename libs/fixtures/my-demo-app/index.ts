import { APP_PACKAGE, CompatibilityDialog, Header } from "components/my-demo-app";
import { AuthSteps, CartSteps } from "steps/my-demo-app";
import { loadEnvironment } from "test-data";
import type { Browser } from "webdriverio";

/**
 * Equivalente móvil de las fixtures de Playwright: WebdriverIO no las tiene, así que el spec
 * pide aquí el ambiente y los steps ya armados con la sesión de Appium.
 */
export function myDemoApp(driver: Browser) {
  const env = loadEnvironment("my-demo-app");

  return {
    env,
    auth: new AuthSteps(driver, env),
    cart: new CartSteps(driver),
    /** Borra los datos de la app y la abre de nuevo: cada test empieza sin sesión ni carrito. */
    restartApp: async (): Promise<void> => {
      await driver.execute("mobile: clearApp", { appId: APP_PACKAGE });
      await driver.execute("mobile: activateApp", { appId: APP_PACKAGE });
      await new CompatibilityDialog(driver).dismissWhileWaitingFor(new Header(driver).menuButton);
    },
  };
}

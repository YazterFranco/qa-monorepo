import { APP_PACKAGE } from "components/[[name]]";
import { AuthSteps } from "steps/[[name]]";
import { loadEnvironment } from "test-data";
import type { Browser } from "webdriverio";

/**
 * Equivalente móvil de las fixtures de Playwright: WebdriverIO no las tiene, así que el spec
 * pide aquí el ambiente y los steps ya armados con la sesión de Appium.
 */
export function [[camel]](driver: Browser) {
  const env = loadEnvironment("[[name]]");

  return {
    env,
    auth: new AuthSteps(driver, env),
    /** Borra los datos de la app y la abre de nuevo: cada test empieza sin sesión. */
    restartApp: async (): Promise<void> => {
      await driver.execute("mobile: clearApp", { appId: APP_PACKAGE });
      await driver.execute("mobile: activateApp", { appId: APP_PACKAGE });
    },
  };
}

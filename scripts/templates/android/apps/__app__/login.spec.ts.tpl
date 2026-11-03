import { driver, expect } from "@wdio/globals";
import { [[camel]] } from "fixtures/[[name]]";
import { HomeScreen } from "pages/[[name]]";

// Punto de partida: ajusta los selectores en libs/pages/[[name]] y los textos esperados en
// libs/test-data/[[name]]/common/messages.json.
describe("login", () => {
  const { env, auth, restartApp } = [[camel]](driver);

  beforeEach(async () => {
    await restartApp();
  });

  it("usuario estándar inicia sesión", async () => {
    await auth.loginAs("standard");

    await expect(new HomeScreen(driver).title).toHaveText(env.messages.homeTitle);
  });
});

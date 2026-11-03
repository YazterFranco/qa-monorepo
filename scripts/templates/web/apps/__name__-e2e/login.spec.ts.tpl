import { expect, test } from "fixtures/[[name]]";
import { HomePage, LoginPage } from "pages/[[name]]";

// Punto de partida: ajusta los selectores en libs/pages/[[name]] y los textos esperados en
// libs/test-data/[[name]]/common/messages.json.

test("usuario estándar inicia sesión", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  await expect(new HomePage(page).heading).toHaveText(env.messages.homeHeading);
});

test("contraseña incorrecta: no entra y ve el error", async ({ auth, env, page }) => {
  await auth.loginAs("invalid");

  await expect(new LoginPage(page).errorMessage).toHaveText(env.messages.invalidCredentials);
});

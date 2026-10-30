import { driver, expect } from "@wdio/globals";
import { myDemoApp } from "fixtures/my-demo-app";
import { CatalogScreen, LoginScreen } from "pages/my-demo-app";

describe("login", () => {
  const { env, auth, restartApp } = myDemoApp(driver);

  beforeEach(async () => {
    await restartApp();
  });

  it("usuario estándar inicia sesión y vuelve al catálogo", async () => {
    await auth.loginAs("standard");

    await expect(new CatalogScreen(driver).title).toHaveText(env.messages.catalogTitle);
  });

  it("usuario bloqueado no entra y ve el error", async () => {
    await auth.loginAs("lockedOut");

    await expect(new LoginScreen(driver).passwordError).toHaveText(env.messages.lockedOut);
  });

  it("sin usuario pide el usuario", async () => {
    await auth.openLogin();
    const login = new LoginScreen(driver);
    await login.submit();

    await expect(login.usernameError).toHaveText(env.messages.usernameRequired);
  });
});

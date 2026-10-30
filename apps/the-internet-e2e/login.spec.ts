import { test, expect } from "fixtures/the-internet";
import { LoginPage } from "pages/the-internet";

test("usuario válido inicia sesión", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  const loginPage = new LoginPage(page);
  await expect(loginPage.flashMessage).toContainText(env.messages.loginSuccess);
});

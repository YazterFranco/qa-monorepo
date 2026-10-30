import { test, expect } from "fixtures";
import { LoginPage } from "pages";

test("usuario válido inicia sesión", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  const loginPage = new LoginPage(page);
  await expect(loginPage.flashMessage).toContainText(env.messages.loginSuccess);
});

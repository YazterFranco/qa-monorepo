import { expect, test } from "fixtures/saucedemo";
import { InventoryPage, LoginPage } from "pages/saucedemo";

test("usuario estándar entra al inventario", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  await expect(new InventoryPage(page).title).toHaveText(env.messages.inventoryTitle);
});

test("usuario lento entra al inventario sin esperas fijas", async ({ auth, env, page }) => {
  await auth.loginAs("performanceGlitch");

  // La app se bloquea unos 5 s al cargar el inventario; la aserción espera sola hasta 15 s.
  await expect(new InventoryPage(page).title).toHaveText(env.messages.inventoryTitle, {
    timeout: 15_000,
  });
});

const rejectedLogins = [
  { scenario: "usuario bloqueado", role: "lockedOut", message: "lockedOut" },
  { scenario: "contraseña incorrecta", role: "invalid", message: "invalidCredentials" },
];

for (const { scenario, role, message } of rejectedLogins) {
  test(`${scenario}: no entra y ve el error`, async ({ auth, env, page }) => {
    await auth.loginAs(role);

    await expect(new LoginPage(page).errorMessage).toHaveText(env.messages[message]);
  });
}

test("sin usuario pide el usuario", async ({ env, page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.submit();

  await expect(loginPage.errorMessage).toHaveText(env.messages.usernameRequired);
});

test("sin contraseña pide la contraseña", async ({ env, page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillUsername(env.users.standard.username);
  await loginPage.submit();

  await expect(loginPage.errorMessage).toHaveText(env.messages.passwordRequired);
});

test("cerrar sesión vuelve al login", async ({ auth, page }) => {
  await auth.loginAs("standard");
  await auth.logout();

  await expect(new LoginPage(page).loginButton).toBeVisible();
});

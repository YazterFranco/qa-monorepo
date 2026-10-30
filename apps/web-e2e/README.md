# web-e2e

Specs de Playwright de la web. Cada spec decide el flujo y la aserción; todo lo demás lo hacen las capas de `libs/`.

## Reglas

- **Archivos `*.spec.ts`.** Cuando haya más de un producto o módulo, se agrupan en carpetas por producto.
- **Importa `test` y `expect` desde `fixtures`**, nunca desde `@playwright/test`.
- **Sin selectores ni credenciales.** Las acciones van por los steps y las aserciones sobre elementos van por las propiedades de los page objects. ESLint prohíbe `locator` y `getBy*` aquí.
- **Aserciones web-first** (`await expect(locator).toContainText(...)`), que esperan solas. Nunca `waitForTimeout`.
- **Tests independientes:** cada uno prepara lo que necesita y se puede correr solo o en cualquier orden.
- Los textos esperados salen de `env.messages`, no se escriben en el spec.

## Ejemplo

[login.spec.ts](login.spec.ts):

```ts
import { test, expect } from "fixtures";
import { LoginPage } from "pages";

test("usuario válido inicia sesión", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  const loginPage = new LoginPage(page);
  await expect(loginPage.flashMessage).toContainText(env.messages.loginSuccess);
});
```

## Correr

```bash
pnpm turbo run test:e2e --filter=web-e2e
pnpm --filter web-e2e exec playwright test --ui
pnpm --filter web-e2e exec playwright show-report
```

La configuración está en [playwright.config.ts](playwright.config.ts): extiende la base de [libs/utils](../../libs/utils) y toma la `baseURL` del ambiente de `TEST_ENV`.

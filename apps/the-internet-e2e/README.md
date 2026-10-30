# the-internet-e2e

Specs de [the-internet.herokuapp.com](https://the-internet.herokuapp.com), la primera demo del monorepo. Hoy cubre el login válido.

## Reglas de los specs

Estas reglas valen para todas las apps de `apps/`:

- **Archivos `*.spec.ts`**, uno por flujo.
- **Importan `test` y `expect` desde `fixtures/<producto>`**, nunca desde `@playwright/test`.
- **Sin selectores ni credenciales.** Las acciones van por los steps y las aserciones sobre elementos van por las propiedades de los page objects. ESLint prohíbe `locator` y `getBy*` aquí.
- **Aserciones web-first** (`await expect(locator).toContainText(...)`), que esperan solas. Nunca `waitForTimeout`.
- **Tests independientes:** cada uno prepara lo que necesita y se puede correr solo o en cualquier orden.
- Los textos esperados salen de `env.messages`, no se escriben en el spec.

## Ejemplo

[login.spec.ts](login.spec.ts):

```ts
import { test, expect } from "fixtures/the-internet";
import { LoginPage } from "pages/the-internet";

test("usuario válido inicia sesión", async ({ auth, env, page }) => {
  await auth.loginAs("standard");

  const loginPage = new LoginPage(page);
  await expect(loginPage.flashMessage).toContainText(env.messages.loginSuccess);
});
```

## Correr

```bash
pnpm turbo run test:e2e --filter=the-internet-e2e
pnpm --filter the-internet-e2e exec playwright test --ui
pnpm --filter the-internet-e2e exec playwright show-report
```

[playwright.config.ts](playwright.config.ts) solo extiende la base de [libs/utils](../../libs/utils); la `baseURL` la pone [fixtures/the-internet](../../libs/fixtures/the-internet) desde el ambiente de `TEST_ENV`.

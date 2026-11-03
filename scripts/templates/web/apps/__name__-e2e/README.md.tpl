# [[name]]-e2e

Pruebas web de `[[name]]` con Playwright. Generada con `pnpm new:app [[name]] --tipo web`.

## Antes de la primera corrida

1. **URL.** Revisa `baseUrl` en [environments/[[environment]].json](../../libs/test-data/[[name]]/environments/[[environment]].json).
2. **Credenciales.** Las cuentas de prueba las crea una persona. Define estas variables en tu terminal y en el context del CI; nunca van en el repo:

   | Variable                        | Para qué                          |
   | ------------------------------- | --------------------------------- |
   | `[[ENV_PREFIX]]_STANDARD_USER`     | Usuario de prueba que sí entra    |
   | `[[ENV_PREFIX]]_STANDARD_PASSWORD` | Contraseña de ese usuario         |

3. **Selectores.** Ajusta [login.page.ts](../../libs/pages/[[name]]/login.page.ts) y [home.page.ts](../../libs/pages/[[name]]/home.page.ts) a tu pantalla. Prefiere `data-testid`, rol o etiqueta.
4. **Textos esperados.** Rellena [messages.json](../../libs/test-data/[[name]]/common/messages.json) con el texto exacto que muestra la app.

## Correr

```bash
export TEST_ENV=[[environment]]
pnpm turbo run test:e2e --filter=[[name]]-e2e
pnpm --filter [[name]]-e2e exec playwright test login.spec.ts
```

Mientras los textos de `messages.json` digan `TODO`, los tests fallan a propósito: así no pasan por error.

## Cómo seguir

- Un escenario nuevo: usa la skill `/agregar-escenario` o copia `login.spec.ts`.
- Sin iniciar sesión en cada test: más adelante se puede guardar la sesión con un proyecto de Playwright (`storageState`). Hoy cada test entra desde cero.
- Si tu login tiene MFA, captcha o SSO, pide un usuario de pruebas que no los tenga o entra por API.

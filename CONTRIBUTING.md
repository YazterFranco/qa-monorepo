# Guía de contribución

## Antes de abrir un PR

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:layers
pnpm test:e2e
```

Al hacer commit, Husky corre `eslint --fix` y `prettier --write` sobre los archivos en stage. Si ESLint marca un error que no puede corregir solo, el commit se detiene.

Si ESLint dice que una capa no puede importar otra, o que un selector no va en ese archivo, el código está en la capa equivocada: revisa la [dirección de dependencias](README.md#dirección-de-dependencias) antes de desactivar la regla.

## Agregar un page

1. Crea `libs/pages/<pantalla>.page.ts` con una clase `<Pantalla>Page`.
2. Declara los locators como propiedades `readonly` con nombres de esa pantalla (`searchInput`, `resultsTable`). Usa `getByRole`, `getByLabel` o un `data-testid` acordado con desarrollo.
3. Agrega las acciones básicas y, si hace falta, una compuesta. Sin aserciones.
4. Expórtala en [libs/pages/index.ts](libs/pages/index.ts).
5. Prueba sus acciones en `tests-of-layers/pages/<pantalla>.page.test.ts` con `createFakePage()`. Si usa un método de Playwright que la page simulada no tiene, agrégalo en [fake-page.ts](tests-of-layers/support/fake-page.ts).

Si un bloque de la pantalla ya existe en otra, sácalo a un componente (ver abajo) en vez de copiar los locators.

## Agregar un componente

Solo cuando el mismo bloque aparece en 2 o más pantallas.

1. Crea `libs/components/<nombre>.component.ts` con una clase que exponga métodos de negocio y oculte sus locators internos.
2. Expórtala en [libs/components/index.ts](libs/components/index.ts).
3. Reemplaza los locators repetidos en los pages por el componente.

## Agregar un step

1. Si el dominio ya tiene archivo (por ejemplo `auth.steps.ts`), agrega el método ahí. Si no, crea `libs/steps/<dominio>.steps.ts` con una clase `<Dominio>Steps` cuyo constructor reciba `(page, environment)`.
2. Nombra los métodos con verbos de negocio (`loginAs`, `createOrder`). Reciben roles o datos, nunca selectores.
3. Expórtala en [libs/steps/index.ts](libs/steps/index.ts).
4. Si la clase es nueva, regístrala como fixture en [base.fixture.ts](libs/fixtures/base.fixture.ts).
5. Prueba el flujo en `tests-of-layers/steps/` con la page simulada.

## Agregar un ambiente

1. Crea `libs/test-data/environments/<nombre>.json` con minúsculas, números y guiones. Sigue el formato de [public-demo.json](libs/test-data/environments/public-demo.json).
2. Escribe cada credencial como `${VAR}`, por ejemplo `"password": "${STAGING_STANDARD_PASSWORD}"`. Nunca valores reales.
3. Agrega cada variable a `passThroughEnv` de `test:e2e` en [turbo.json](turbo.json) y al context `qa-e2e` de CircleCI.
4. Pruébalo localmente:

   ```bash
   STAGING_STANDARD_PASSWORD=... TEST_ENV=staging pnpm test:e2e
   ```

Si el archivo no cumple el esquema o falta una variable, la carga falla antes de abrir el navegador y dice qué está mal.

## Agregar un spec

1. Crea `apps/web-e2e/<nombre>.spec.ts`, o una carpeta por producto cuando haya varios.
2. Importa `test` y `expect` desde `fixtures`.
3. El spec solo decide el flujo (con steps) y la aserción (sobre propiedades de un page). Sin selectores, sin credenciales y sin `waitForTimeout`.

## Agregar un producto

1. Crea `apps/<producto>-e2e/` copiando `package.json`, `tsconfig.json` y `playwright.config.ts` de [apps/web-e2e](apps/web-e2e). Cambia el `name` del `package.json`.
2. Corre `pnpm install` para registrar el paquete.
3. En [ci/circleci/config.yml](ci/circleci/config.yml), agrega el nombre a las dos listas `app:` del workflow (`e2e` y `e2e-report`).

## Nombres

| Qué            | Formato                        | Ejemplo                       |
| -------------- | ------------------------------ | ----------------------------- |
| Page           | `<pantalla>.page.ts`           | `login.page.ts`               |
| Componente     | `<nombre>.component.ts`        | `confirm-dialog.component.ts` |
| Steps          | `<dominio>.steps.ts`           | `auth.steps.ts`               |
| Fixture        | `<dominio>.fixture.ts`         | `orders.fixture.ts`           |
| Spec           | `<flujo>.spec.ts`              | `login.spec.ts`               |
| Prueba de capa | `<archivo>.test.ts`            | `login.page.test.ts`          |
| Ambiente       | `environments/<ambiente>.json` | `staging.json`                |
| Datos comunes  | `common/<dominio>.json`        | `users.json`                  |

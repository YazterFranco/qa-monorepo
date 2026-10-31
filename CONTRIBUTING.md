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

En los pasos de abajo, `<producto>` es la carpeta del producto en cada capa: `the-internet`, `saucedemo`, `restful-booker` o `my-demo-app`.

## Agregar un page

1. Crea `libs/pages/<producto>/<pantalla>.page.ts` con una clase `<Pantalla>Page`.
2. Declara los locators como propiedades `readonly` con nombres de esa pantalla (`searchInput`, `resultsTable`). Usa `getByRole`, `getByLabel` o un `data-testid` acordado con desarrollo.
3. Agrega las acciones básicas y, si hace falta, una compuesta. Sin aserciones.
4. Expórtala en `libs/pages/<producto>/index.ts`.
5. Prueba sus acciones en `tests-of-layers/pages/<producto>/<pantalla>.page.test.ts` con `createFakePage()`. Si usa un método de Playwright que la page simulada no tiene, agrégalo en [fake-page.ts](tests-of-layers/support/fake-page.ts).

Si un bloque de la pantalla ya existe en otra, sácalo a un componente (ver abajo) en vez de copiar los locators.

## Agregar un componente

Solo cuando el mismo bloque aparece en 2 o más pantallas.

1. Crea `libs/components/<producto>/<nombre>.component.ts` con una clase que reciba su contenedor, exponga métodos de negocio y oculte sus locators internos. Si lo comparten varios productos, va en `libs/components/` directamente.
2. Expórtala en el `index.ts` de esa carpeta.
3. Reemplaza los locators repetidos en los pages por el componente. Ejemplo: [header.component.ts](libs/components/saucedemo/header.component.ts).

## Agregar un step

1. Si el dominio ya tiene archivo (por ejemplo `libs/steps/saucedemo/cart.steps.ts`), agrega el método ahí. Si no, crea `libs/steps/<producto>/<dominio>.steps.ts` con una clase `<Dominio>Steps` que reciba la `page` y, si lo necesita, el ambiente.
2. Nombra los métodos con verbos de negocio (`loginAs`, `completeOrder`). Reciben roles o datos, nunca selectores.
3. Expórtala en `libs/steps/<producto>/index.ts`.
4. Si la clase es nueva, regístrala como fixture en `libs/fixtures/<producto>/index.ts`.
5. Prueba el flujo en `tests-of-layers/steps/<producto>/` con la page simulada.

## Agregar un ambiente

1. Crea `libs/test-data/<producto>/environments/<nombre>.json` con minúsculas, números y guiones. Sigue el formato de [public-demo.json](libs/test-data/saucedemo/environments/public-demo.json).
2. Pon ahí solo lo que cambia por ambiente (`baseUrl`, `users`). Lo que es igual en todos va en `<producto>/common/`.
3. Escribe cada credencial como `${VAR}`, por ejemplo `"password": "${STAGING_STANDARD_PASSWORD}"`. Nunca valores reales.
4. Agrega cada variable a `passThroughEnv` de `test:e2e` en [turbo.json](turbo.json) y al context `qa-e2e` de CircleCI.
   La clave todavía no existe en `turbo.json`; la primera vez se agrega así:

   ```json
   "test:e2e": {
     "env": ["TEST_ENV"],
     "passThroughEnv": ["STAGING_STANDARD_PASSWORD"]
   }
   ```

   `passThroughEnv` pasa la variable a la tarea sin que su valor cuente para la caché de Turbo.

5. Pruébalo localmente:

   ```bash
   STAGING_STANDARD_PASSWORD=... TEST_ENV=staging pnpm turbo run test:e2e --filter=saucedemo-e2e
   ```

Si el archivo no cumple el esquema o falta una variable, la carga falla antes de abrir el navegador y dice qué está mal.

## Agregar un spec

1. Crea `apps/<producto>-e2e/<flujo>.spec.ts`.
2. Importa `test` y `expect` desde `fixtures/<producto>`.
3. El spec solo decide el flujo (con steps) y la aserción (sobre propiedades de un page). Sin selectores, sin credenciales y sin `waitForTimeout`.
4. Para varios casos con el mismo flujo, usa una tabla y un `for`, como en [checkout.spec.ts](apps/saucedemo-e2e/checkout.spec.ts).
5. Si el producto tiene un bug conocido, escribe el test con el comportamiento correcto y márcalo con `test.fail(condición, "motivo")`. Revisa que falle por la aserción esperada y no por un selector roto.

## Agregar pruebas de API

1. Crea el cliente en `libs/api/<producto>/<recurso>.client.ts`: recibe el `request` de Playwright y devuelve la respuesta cruda.
2. Escribe el contrato de cada respuesta con Zod en `libs/api/<producto>/schemas.ts`.
3. En el spec, revisa el estado y lee el cuerpo con `parseBody(respuesta, esquema)`, como en [booking.spec.ts](apps/restful-booker-api/booking.spec.ts).
4. Si un test necesita datos previos, créalos con un step (`bookings.create`) y no a través de otro test.
5. Prueba el cliente en `tests-of-layers/api/<producto>/` con `createFakeRequest()`.

## Agregar pruebas móviles

1. Crea la pantalla en `libs/pages/<producto>/<pantalla>.screen.ts`, con getters que usen accessibility id (`~...`) o resource-id.
2. Si una navegación abre una pantalla nueva, hazla en un step que espere esa pantalla, como `AuthSteps.openLogin` en [steps/my-demo-app](libs/steps/my-demo-app/auth.steps.ts).
3. En el spec, toma `env` y los steps de `myDemoApp(driver)` y llama a `restartApp()` en `beforeEach`.
4. Para ver los ids de una pantalla, abre la app en el emulador y usa Appium Inspector o `adb shell uiautomator dump`.

## Agregar un producto

1. **Datos:** crea `libs/test-data/<producto>/environments/public-demo.json` (o el ambiente que corresponda) y, si hace falta, `common/`.
2. **Capas:** crea `libs/pages/<producto>/`, `libs/steps/<producto>/` y, si los hay, `libs/components/<producto>/`, cada una con su `index.ts`.
3. **Fixtures:** crea `libs/fixtures/<producto>/index.ts` con `productTest("<producto>").extend({ ... })`, como en [fixtures/saucedemo](libs/fixtures/saucedemo/index.ts).
4. **App:** crea `apps/<producto>-e2e/` copiando `package.json`, `tsconfig.json` y `playwright.config.ts` de [apps/saucedemo-e2e](apps/saucedemo-e2e) (web) o [apps/restful-booker-api](apps/restful-booker-api) (API), y cambia el `name` del `package.json`. Si el producto usa otro atributo de test, ajusta `testIdAttribute`.
5. Corre `pnpm install` para registrar la app.
6. **CI:** en [ci/circleci/config.yml](ci/circleci/config.yml), agrega `<producto>-e2e` a las dos listas `app:` del workflow (`e2e` y `e2e-report`).

## Nombres

| Qué            | Formato                                   | Ejemplo                               |
| -------------- | ----------------------------------------- | ------------------------------------- |
| App            | `apps/<producto>-e2e`                     | `apps/saucedemo-e2e`                  |
| Page           | `<pantalla>.page.ts`                      | `inventory.page.ts`                   |
| Componente     | `<nombre>.component.ts`                   | `header.component.ts`                 |
| Steps          | `<dominio>.steps.ts`                      | `checkout.steps.ts`                   |
| Spec           | `<flujo>.spec.ts`                         | `checkout.spec.ts`                    |
| Prueba de capa | `<archivo>.test.ts`                       | `inventory.page.test.ts`              |
| Ambiente       | `<producto>/environments/<ambiente>.json` | `saucedemo/environments/staging.json` |
| Datos comunes  | `<producto>/common/<dominio>.json`        | `saucedemo/common/products.json`      |
| Cliente de API | `<recurso>.client.ts`                     | `booking.client.ts`                   |
| Screen móvil   | `<pantalla>.screen.ts`                    | `login.screen.ts`                     |

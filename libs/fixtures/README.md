# fixtures

Extiende el `test` de Playwright con lo que necesita cada spec: el ambiente cargado y los steps listos para usar. Es el único lugar donde se conectan las capas.

```
libs/fixtures/
  base.fixture.ts   productTest(producto): env y baseURL, comunes a todos
  the-internet/     test con auth
  saucedemo/        test con auth, cart y checkout
  restful-booker/   test con authApi, bookingApi, auth y bookings (solo request)
  my-demo-app/      myDemoApp(driver): env, auth, cart y restartApp (WebdriverIO)
```

## Fixtures disponibles

| Fixture    | Alcance | Producto  | Qué es                                                            |
| ---------- | ------- | --------- | ----------------------------------------------------------------- |
| `env`      | worker  | todos     | Los datos del producto en `TEST_ENV`, cargados una vez por worker |
| `baseURL`  | test    | todos     | La `baseUrl` del ambiente; los pages navegan con rutas relativas  |
| `auth`     | test    | todos     | `AuthSteps` del producto                                          |
| `cart`     | test    | saucedemo | `CartSteps`                                                       |
| `checkout` | test    | saucedemo | `CheckoutSteps`                                                   |

Las fixtures de `restful-booker` usan `request` en vez de `page`, así que sus tests no abren navegador.

WebdriverIO no tiene fixtures, así que `my-demo-app` exporta una función que el spec llama con el `driver`:

```ts
const { env, auth, restartApp } = myDemoApp(driver);

beforeEach(async () => {
  await restartApp(); // borra los datos de la app y la abre de nuevo
});
```

## Reglas

- **Los specs importan `test` y `expect` desde `fixtures/<producto>`**, nunca desde `@playwright/test`. ESLint lo revisa en los specs.
- **Cada producto parte de `productTest("<producto>")`**, que carga sus datos y fija la `baseURL`. Por eso la config de cada app no carga datos.
- Las fixtures crean objetos e inyectan dependencias. La lógica de negocio va en `steps`.
- Lo que no cambia entre tests (como el ambiente) va con `scope: "worker"`.
- Si un producto crece mucho, sus fixtures se pueden dividir por dominio y combinar con `mergeTests`.

## Ejemplo

[saucedemo/index.ts](saucedemo/index.ts):

```ts
export const test = productTest("saucedemo").extend<TestFixtures>({
  auth: async ({ page, env }, use) => {
    await use(new AuthSteps(page, env));
  },
  cart: async ({ page }, use) => {
    await use(new CartSteps(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutSteps(page));
  },
});
```

En el spec:

```ts
import { expect, test } from "fixtures/saucedemo";

test("compra completa de un producto", async ({ auth, cart, checkout, env }) => {
  await auth.loginAs("standard");
  await cart.add(env.products.backpack);
  await checkout.completeOrder(env.customers.standard);
});
```

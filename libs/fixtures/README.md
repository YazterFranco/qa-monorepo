# fixtures

Extiende el `test` de Playwright con lo que necesita cada spec: el ambiente cargado y los steps listos para usar. Es el único lugar donde se conectan las capas.

## Fixtures disponibles

| Fixture | Alcance | Qué es                                                |
| ------- | ------- | ----------------------------------------------------- |
| `env`   | worker  | El ambiente de `TEST_ENV`, cargado una vez por worker |
| `auth`  | test    | `AuthSteps` con la `page` del test y el `env`         |

## Reglas

- **Los specs importan `test` y `expect` desde `fixtures`**, nunca desde `@playwright/test`. ESLint lo revisa en los specs.
- **Hoy hay una sola fixture base**, [base.fixture.ts](base.fixture.ts). Cuando crezca, se divide en una por dominio (`orders.fixture.ts`) y se combinan con `mergeTests`.
- Las fixtures crean objetos e inyectan dependencias. La lógica de negocio va en `steps`.
- Lo que no cambia entre tests (como el ambiente) va con `scope: "worker"`.

## Ejemplo

Agregar los steps de un dominio nuevo:

```ts
interface TestFixtures {
  auth: AuthSteps;
  orders: OrderSteps;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ...env y auth
  orders: async ({ page, env }, use) => {
    await use(new OrderSteps(page, env));
  },
});
```

En el spec:

```ts
import { test, expect } from "fixtures";

test("crea un pedido", async ({ auth, orders }) => {
  await auth.loginAs("standard");
  await orders.create(/* ... */);
});
```

# saucedemo-e2e

Specs de [saucedemo.com](https://www.saucedemo.com), una tienda de práctica con usuarios que simulan fallas reales: bloqueado, lento y con bugs en el inventario y el carrito.

## Escenarios

| Spec                                   | Escenario                                        | Usuario             | Resultado esperado               |
| -------------------------------------- | ------------------------------------------------ | ------------------- | -------------------------------- |
| [login.spec.ts](login.spec.ts)         | Login correcto                                   | `standard`          | Ve el inventario                 |
|                                        | Login con la app lenta (~5 s), sin esperas fijas | `performanceGlitch` | Ve el inventario                 |
|                                        | Usuario bloqueado                                | `lockedOut`         | Error de bloqueo                 |
|                                        | Contraseña incorrecta                            | `invalid`           | Error de credenciales            |
|                                        | Sin usuario / sin contraseña                     | —                   | Pide el campo que falta          |
|                                        | Cerrar sesión                                    | `standard`          | Vuelve al login                  |
| [inventory.spec.ts](inventory.spec.ts) | Ordenar por precio de menor a mayor              | `standard`          | Precios en orden                 |
|                                        |                                                  | `problem`, `error`  | **Bug conocido** (`test.fail`)   |
| [cart.spec.ts](cart.spec.ts)           | Agregar y quitar productos                       | `standard`          | El contador y el carrito cambian |
|                                        | Agregar un producto con bug                      | `problem`           | **Bug conocido** (`test.fail`)   |
| [checkout.spec.ts](checkout.spec.ts)   | Compra completa                                  | `standard`          | Confirmación de la orden         |
|                                        | Sin nombre / apellido / código postal            | `standard`          | Pide el campo que falta          |

Los usuarios, clientes, productos y mensajes están en [libs/test-data/saucedemo](../../libs/test-data/saucedemo).

## Bugs conocidos

`problem_user` y `error_user` tienen fallas a propósito. Sus tests describen el comportamiento correcto y se marcan con `test.fail`:

- Playwright los cuenta como correctos mientras fallen.
- Si un día pasan, el reporte los marca como fallidos: el bug se arregló y hay que quitar el `test.fail`.

Al agregar uno, revisa en el reporte que falle por la aserción esperada (el orden o el contador no cambian) y no por un selector roto.

## Correr

```bash
pnpm turbo run test:e2e --filter=saucedemo-e2e
pnpm --filter saucedemo-e2e exec playwright test --ui
pnpm --filter saucedemo-e2e exec playwright show-report
```

[playwright.config.ts](playwright.config.ts) extiende la base de [libs/utils](../../libs/utils) y pone `testIdAttribute: "data-test"`, el atributo que usa Sauce Demo. La `baseURL` la pone [fixtures/saucedemo](../../libs/fixtures/saucedemo) desde el ambiente de `TEST_ENV`.

Las reglas de los specs están en [apps/the-internet-e2e/README.md](../the-internet-e2e/README.md#reglas-de-los-specs).

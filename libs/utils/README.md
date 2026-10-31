# utils

Piezas técnicas que no son de negocio: la configuración base de Playwright y, más adelante, helpers y reporters. Los clientes de API no van aquí: están en [libs/api](../api).

## Contenido

| Archivo                                  | Qué es                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| [playwright.base.ts](playwright.base.ts) | `basePlaywrightConfig`, que extiende cada app de `apps/` |

La configuración base fija:

- Pruebas en paralelo, solo Chromium por ahora.
- Trace en el primer reintento, screenshot y video solo en los fallos.
- **Local:** sin reintentos, reporte en consola y HTML.
- **En CI (`CI` definida):** 2 reintentos, 2 workers, prohíbe `test.only` y genera JUnit y un reporte "blob" por shard, que el pipeline une en un solo HTML.

No fija navegador: las apps web agregan `desktopChromium` en `projects`, y la de API usa un proyecto sin navegador.

La `baseURL` no va aquí: la pone la fixture de cada producto a partir de su ambiente.

## Reglas

- Nada de negocio: si una función conoce una pantalla o un flujo, va en `pages` o `steps`.
- **No importa** `components`, `pages`, `steps` ni `fixtures`.
- Lo que se exporta se agrega a [index.ts](index.ts).

## Ejemplo

[apps/saucedemo-e2e/playwright.config.ts](../../apps/saucedemo-e2e/playwright.config.ts):

```ts
import { defineConfig } from "@playwright/test";
import { basePlaywrightConfig, desktopChromium } from "utils";

export default defineConfig(basePlaywrightConfig, {
  testDir: ".",
  projects: [desktopChromium],
  use: { testIdAttribute: "data-test" },
});
```

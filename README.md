# qa-monorepo

Monorepo de automatización de pruebas. Reúne en un solo lugar los specs de cada producto y las capas que comparten: datos por ambiente, page objects, componentes, acciones de negocio y fixtures.

- **Web:** Playwright.
- **Móvil nativo:** Appium, en un job aparte (pendiente: `apps/mobile-e2e`).
- **Herramientas:** pnpm workspaces y Turborepo, que ejecuta las tareas en orden y no repite las que no cambiaron.

Se cambia de ambiente con una variable (`TEST_ENV`), sin tocar código. Las credenciales nunca están en el repo.

## Requisitos

- Node 24 (está en [.nvmrc](.nvmrc)).
- pnpm 12.16.1 (está en `packageManager` de [package.json](package.json)).

## Instalación

```bash
nvm use
npm install --global pnpm@12.16.1
pnpm install
pnpm --filter web-e2e exec playwright install chromium
```

`pnpm install` también activa los git hooks de Husky. El último comando solo hace falta la primera vez o cuando cambia la versión de Playwright.

## Comandos

| Comando             | Qué hace                                                      |
| ------------------- | ------------------------------------------------------------- |
| `pnpm lint`         | ESLint en todos los paquetes, con las reglas de capas         |
| `pnpm format`       | Formatea todo con Prettier                                    |
| `pnpm format:check` | Revisa el formato sin cambiar archivos                        |
| `pnpm typecheck`    | TypeScript en modo `strict` en todos los paquetes             |
| `pnpm test:layers`  | Pruebas de cada capa, sin navegador                           |
| `pnpm test:e2e`     | Specs de todos los productos contra el ambiente de `TEST_ENV` |

Ejemplos:

```bash
# Otro ambiente: usa libs/test-data/environments/qa.json (por defecto: public-demo)
TEST_ENV=qa pnpm test:e2e

# Un solo producto
pnpm turbo run test:e2e --filter=web-e2e

# Opciones de Playwright: modo UI, con navegador visible, un archivo
pnpm --filter web-e2e exec playwright test --ui
pnpm --filter web-e2e exec playwright test --headed login.spec.ts

# Abrir el último reporte HTML
pnpm --filter web-e2e exec playwright show-report
```

## Estructura

```
apps/
  web-e2e/          specs de Playwright por producto
libs/
  test-data/        datos por ambiente, validados con Zod
  pages/            un page object por pantalla
  components/       componentes que usan 2 o más pantallas
  steps/            acciones de negocio por dominio
  fixtures/         test extendido con env y steps
  utils/            configuración base de Playwright y helpers
tests-of-layers/    pruebas de cada capa, sin navegador
ci/circleci/        pipeline de CircleCI
```

Cada carpeta tiene su README con el propósito, las reglas y un ejemplo.

## Dirección de dependencias

```
specs → fixtures → steps → pages → components
                     ↓
                 test-data
```

Ninguna capa conoce a la de arriba. ESLint lo hace cumplir: falla si, por ejemplo, un page importa un step, si un spec usa un selector o si un page object hace una aserción. Las reglas están en [eslint.config.mjs](eslint.config.mjs).

Los paquetes se importan por su nombre (`pages`, `steps`, `fixtures`, `test-data`, `components`, `utils`), gracias a los alias de [tsconfig.base.json](tsconfig.base.json).

## Ambientes y credenciales

- `TEST_ENV` elige el archivo de [libs/test-data/environments](libs/test-data/environments). Por defecto es `public-demo`.
- Las credenciales se escriben como `${VAR}` y se resuelven desde variables de entorno o desde los secretos del CI. Si falta una variable, la carga falla con su nombre, sin mostrar valores.
- Turbo solo pasa a las tareas las variables declaradas. Cada variable nueva va en `passThroughEnv` de `test:e2e` en [turbo.json](turbo.json).

Detalles en [libs/test-data/README.md](libs/test-data/README.md).

## CI

[ci/circleci/config.yml](ci/circleci/config.yml) corre `lint → typecheck → test:layers → test:e2e` por producto, con sharding de Playwright, y une los reportes en un solo HTML. Antes del primer run:

- En Project Settings de CircleCI, apunta la fuente del config a `ci/circleci/config.yml` (CircleCI busca `.circleci/config.yml` por defecto).
- Crea el context `qa-e2e` en Organization Settings → Contexts. Ahí van las credenciales.

## Decisiones

| Tema                | Decisión                                                                              |
| ------------------- | ------------------------------------------------------------------------------------- |
| Locators            | Dentro del page object; pasan a `components` solo si se usan en 2 o más lugares       |
| Selectores          | `getByRole`, `getByLabel` o `data-testid` acordado con desarrollo; nunca IDs frágiles |
| Nombres de datos    | Por ambiente (`environments/`) o por dominio (`common/`), nunca por uso               |
| Nombres de paquetes | Sin prefijos ni `src`; se importan por alias                                          |
| TypeScript          | 6.0, porque typescript-eslint todavía no soporta la 7                                 |

## Contribuir

Cómo agregar un page, un step, un ambiente o un producto: [CONTRIBUTING.md](CONTRIBUTING.md).

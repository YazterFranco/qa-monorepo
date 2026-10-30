# qa-monorepo

Monorepo de automatización de pruebas. Reúne en un solo lugar los specs de cada producto y las capas que comparten: datos por ambiente, page objects, clientes de API, componentes, acciones de negocio y fixtures.

- **Web y API:** Playwright.
- **Móvil nativo:** Appium con WebdriverIO, sobre Android.
- **Herramientas:** pnpm workspaces y Turborepo, que ejecuta las tareas en orden y no repite las que no cambiaron.

Se cambia de ambiente con una variable (`TEST_ENV`), sin tocar código. Las credenciales nunca están en el repo.

Hoy hay cuatro productos de demostración:

| Producto       | Tipo           | App                                                | Qué prueba                                                                |
| -------------- | -------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| the-internet   | Web            | [apps/the-internet-e2e](apps/the-internet-e2e)     | Login de [the-internet.herokuapp.com](https://the-internet.herokuapp.com) |
| saucedemo      | Web            | [apps/saucedemo-e2e](apps/saucedemo-e2e)           | Login, inventario, carrito y checkout, con usuarios que simulan fallas    |
| restful-booker | API REST       | [apps/restful-booker-api](apps/restful-booker-api) | Token, alta, lectura, búsqueda, actualización y borrado de reservas       |
| my-demo-app    | Android nativo | [apps/my-demo-app-e2e](apps/my-demo-app-e2e)       | Login y carrito de la app de demo de Sauce Labs en un emulador            |

## Requisitos

- Node 24 (está en [.nvmrc](.nvmrc)).
- pnpm 12.16.1 (está en `packageManager` de [package.json](package.json)).
- Solo para móvil: Android SDK con un emulador (por defecto `Pixel_10_Pro`) y Java 17 o más. Detalles en [apps/my-demo-app-e2e](apps/my-demo-app-e2e).

## Instalación

```bash
nvm use
npm install --global pnpm@12.16.1
pnpm install
pnpm --filter saucedemo-e2e exec playwright install chromium
```

`pnpm install` también activa los git hooks de Husky. El último comando solo hace falta la primera vez o cuando cambia la versión de Playwright; los navegadores sirven para todas las apps web.

Para móvil, además, una vez:

```bash
pnpm --filter my-demo-app-e2e app:download
```

## Comandos

| Comando             | Qué hace                                                              |
| ------------------- | --------------------------------------------------------------------- |
| `pnpm lint`         | ESLint en todos los paquetes, con las reglas de capas                 |
| `pnpm format`       | Formatea todo con Prettier                                            |
| `pnpm format:check` | Revisa el formato sin cambiar archivos                                |
| `pnpm typecheck`    | TypeScript en modo `strict` en todos los paquetes                     |
| `pnpm test:layers`  | Pruebas de cada capa, sin navegador ni red                            |
| `pnpm test:e2e`     | Specs web y de API contra el ambiente de `TEST_ENV`                   |
| `pnpm test:mobile`  | Specs de Android; necesita el emulador (Appium lo arranca si no está) |

Ejemplos:

```bash
# Otro ambiente: usa libs/test-data/<producto>/environments/qa.json (por defecto: public-demo)
TEST_ENV=qa pnpm test:e2e

# Un solo producto
pnpm turbo run test:e2e --filter=restful-booker-api

# Opciones de Playwright: modo UI, con navegador visible, un archivo
pnpm --filter saucedemo-e2e exec playwright test --ui
pnpm --filter saucedemo-e2e exec playwright test --headed checkout.spec.ts

# Abrir el último reporte HTML
pnpm --filter saucedemo-e2e exec playwright show-report

# Un solo archivo móvil
pnpm --filter my-demo-app-e2e exec wdio run wdio.conf.ts --spec login.spec.ts
```

## Estructura

```
apps/
  the-internet-e2e/      una app por producto
  saucedemo-e2e/
  restful-booker-api/
  my-demo-app-e2e/
libs/
  test-data/             cargador común + una carpeta de datos por producto
  pages/<producto>/      un page object (web) o screen (móvil) por pantalla
  api/<producto>/        un cliente por recurso de la API y sus contratos
  components/<producto>/ partes de la interfaz que usan 2 o más pantallas
  steps/<producto>/      acciones de negocio por dominio
  fixtures/<producto>/   arma env y steps para cada spec
  utils/                 configuración base de Playwright y helpers
tests-of-layers/         pruebas de cada capa, sin navegador ni red
ci/circleci/             pipeline de CircleCI
```

Cada carpeta tiene su README con el propósito, las reglas y un ejemplo.

## Dirección de dependencias

```
specs → fixtures → steps → pages | api → components
                     ↓
                 test-data
```

Ninguna capa conoce a la de arriba. ESLint lo hace cumplir: falla si, por ejemplo, un page importa un step, si un spec usa un selector (`getBy*`, `locator`, `$`) o si un page object hace una aserción. Las reglas están en [eslint.config.mjs](eslint.config.mjs).

Cada capa se importa por producto (`pages/saucedemo`, `api/restful-booker`), gracias a los alias de [tsconfig.base.json](tsconfig.base.json). Lo que comparten todos los productos se importa sin subruta: `test-data`, `utils` y `components`.

Web, API y móvil comparten los datos (`test-data`), las reglas de capas y el formato de los steps. Lo que cambia es la herramienta debajo: Playwright `Page` en web, Playwright `request` en API y una sesión de Appium en móvil.

## Ambientes y credenciales

- `TEST_ENV` elige el archivo `libs/test-data/<producto>/environments/<ambiente>.json`. Por defecto es `public-demo`.
- Ese archivo se combina con `libs/test-data/<producto>/common/*.json`, que guarda lo que no cambia entre ambientes. Si una clave está en los dos, gana el ambiente.
- Las credenciales se escriben como `${VAR}` y se resuelven desde variables de entorno o desde los secretos del CI. Si falta una variable, la carga falla con su nombre, sin mostrar valores.
- Turbo solo pasa a las tareas las variables declaradas. Cada variable nueva va en `passThroughEnv` de `test:e2e` (o `test:mobile`) en [turbo.json](turbo.json).

Detalles en [libs/test-data/README.md](libs/test-data/README.md).

## CI

[ci/circleci/config.yml](ci/circleci/config.yml) corre `lint → typecheck → test:layers → test:e2e`, con un job por producto web o de API y sharding de Playwright, y une los reportes en un solo HTML por producto. Antes del primer run:

- En Project Settings de CircleCI, apunta la fuente del config a `ci/circleci/config.yml` (CircleCI busca `.circleci/config.yml` por defecto).
- Crea el context `qa-e2e` en Organization Settings → Contexts. Ahí van las credenciales.

El job móvil está escrito como pendiente: necesita un emulador Android en CI.

## Decisiones

| Tema                | Decisión                                                                                |
| ------------------- | --------------------------------------------------------------------------------------- |
| Productos           | Una app por producto en `apps/` y una subcarpeta por producto en cada capa              |
| Locators            | Dentro del page object; pasan a `components` solo si se usan en 2 o más lugares         |
| Selectores          | Web: `getByRole`, `getByLabel` o `data-testid`. Android: accessibility id o resource-id |
| Contratos de API    | Cada respuesta se valida con un esquema Zod antes de usarla                             |
| Nombres de datos    | Por ambiente (`environments/`) o por dominio (`common/`), nunca por uso                 |
| Nombres de paquetes | Sin prefijos ni `src`; se importan por alias                                            |
| Bugs conocidos      | El test describe el comportamiento correcto y se marca con `test.fail`                  |
| TypeScript          | 6.0, porque typescript-eslint todavía no soporta la 7                                   |

## Contribuir

Cómo agregar un page, un cliente de API, un step, un ambiente o un producto: [CONTRIBUTING.md](CONTRIBUTING.md).

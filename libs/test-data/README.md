# test-data

Datos de prueba fuera del código: URL, usuarios, mensajes, clientes y productos de cada producto y ambiente. Todo se valida con Zod al cargar, así que un archivo mal escrito falla antes de abrir el navegador.

## Archivos

```
libs/test-data/
  schema.ts                         esquema Zod y tipos (Environment, User, Customer, Product, Booking)
  loader.ts                         loadEnvironment(producto, ambiente)
  <producto>/
    environments/<ambiente>.json    lo que cambia por ambiente: baseUrl, users
    common/<dominio>.json           lo que es igual en todos: messages, customers, products, bookings
```

Productos: `the-internet` y `saucedemo` (web), `restful-booker` (API, con reservas en `common/bookings.json`) y `my-demo-app` (Android).

`baseUrl` es opcional porque una app móvil no la tiene; las fixtures de web y API fallan con un mensaje claro si falta.

## Cómo se carga

`loadEnvironment(producto, ambiente)`:

1. Lee cada archivo de `<producto>/common/`. El nombre del archivo es la clave: `products.json` → `env.products`.
2. Le aplica encima `<producto>/environments/<ambiente>.json`. Si una clave está en los dos, gana el ambiente.
3. Reemplaza cada `${VAR}` por su variable de entorno.
4. Valida con el esquema. Es estricto: una clave desconocida, como un `common/costumers.json` mal escrito, falla en vez de perderse.

Sin ambiente, usa `TEST_ENV` o `public-demo`. Los specs no lo llaman directamente: la fixture `env` de cada producto lo hace una vez por worker.

## Reglas

- **Nombres por ambiente o por dominio, nunca por uso.** `environments/staging.json` o `common/products.json`; nunca `checkout-test-data.json`.
- **Sin credenciales en el repo.** Fuera de `public-demo`, cuyas credenciales son públicas, cada valor sensible se escribe como `${VAR}`.
- **Nombres de producto y ambiente** en minúsculas, números y guiones.
- **No conoce a otras capas** ni a Playwright.

## Ejemplo

`saucedemo/environments/staging.json`:

```json
{
  "baseUrl": "https://staging.example.com",
  "users": {
    "standard": { "username": "qa.standard", "password": "${STAGING_STANDARD_PASSWORD}" }
  }
}
```

```ts
import { loadEnvironment } from "test-data";

const env = loadEnvironment("saucedemo"); // TEST_ENV=staging
env.users.standard.password; // valor de STAGING_STANDARD_PASSWORD
env.products.backpack.name; // "Sauce Labs Backpack", de common/products.json
```

Si `STAGING_STANDARD_PASSWORD` no está definida, falla con `Falta la variable de entorno STAGING_STANDARD_PASSWORD.`

Para que la variable llegue a las pruebas, agrégala a `passThroughEnv` de `test:e2e` en [turbo.json](../../turbo.json) y al context `qa-e2e` de CircleCI.

## Pruebas

[tests-of-layers/test-data](../../tests-of-layers/test-data): datos reales de cada producto, combinación con `common/`, esquema inválido, claves desconocidas, variables que faltan y nombres inválidos o que intentan salir de la carpeta.

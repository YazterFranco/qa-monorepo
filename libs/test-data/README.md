# test-data

Datos de prueba fuera del código: URL, usuarios y mensajes de cada ambiente. Todo se valida con Zod al cargar, así que un archivo mal escrito falla antes de abrir el navegador.

## Archivos

| Archivo                    | Contenido                                                                       |
| -------------------------- | ------------------------------------------------------------------------------- |
| `environments/<name>.json` | Datos de un ambiente (`local`, `qa`, `staging`…). Hoy solo existe `public-demo` |
| `common/`                  | Datos compartidos entre ambientes, por dominio (pendiente)                      |
| `schema.ts`                | Esquema Zod de un ambiente y sus tipos (`Environment`, `User`)                  |
| `loader.ts`                | `loadEnvironment()`: lee, resuelve `${VAR}` y valida                            |

## Reglas

- **Nombres por ambiente o por dominio, nunca por uso.** `environments/staging.json` o `common/users.json`; nunca `login-test-data.json`.
- **Sin credenciales en el repo.** Fuera de `public-demo`, cuyas credenciales son públicas, cada valor sensible se escribe como `${VAR}`.
- **El ambiente se elige con `TEST_ENV`.** Sin la variable se usa `public-demo`. El nombre solo acepta minúsculas, números y guiones.
- **No conoce a otras capas** ni a Playwright.

## Ejemplo

`environments/staging.json`:

```json
{
  "baseUrl": "https://staging.example.com",
  "users": {
    "standard": { "username": "qa.standard", "password": "${STAGING_STANDARD_PASSWORD}" }
  },
  "messages": {
    "loginSuccess": "You logged into a secure area!"
  }
}
```

```ts
import { loadEnvironment } from "test-data";

const env = loadEnvironment(); // TEST_ENV=staging → environments/staging.json
env.users.standard.password; // valor de STAGING_STANDARD_PASSWORD
```

Si `STAGING_STANDARD_PASSWORD` no está definida, falla con `Falta la variable de entorno STAGING_STANDARD_PASSWORD.`

Para que la variable llegue a las pruebas, agrégala a `passThroughEnv` de `test:e2e` en [turbo.json](../../turbo.json) y al context `qa-e2e` de CircleCI.

## Pruebas

[tests-of-layers/test-data](../../tests-of-layers/test-data): esquema inválido, variables que faltan, ambientes que no existen y nombres que intentan salir de la carpeta.

# restful-booker-api

Pruebas de API de [Restful Booker](https://restful-booker.herokuapp.com), una API pública de reservas hecha para practicar QA. Usan la fixture `request` de Playwright: no abren navegador y corren en segundos.

## Escenarios

| Spec                               | Escenario                               | Resultado esperado                        |
| ---------------------------------- | --------------------------------------- | ----------------------------------------- |
| [auth.spec.ts](auth.spec.ts)       | Admin pide un token                     | 200 y un token                            |
|                                    | Credenciales incorrectas                | 200 con `reason: "Bad credentials"`       |
| [booking.spec.ts](booking.spec.ts) | Crear una reserva                       | 200, id y los mismos datos                |
|                                    | Leer la reserva por id                  | 200 y los datos creados                   |
|                                    | Buscar por nombre                       | La lista incluye el id                    |
|                                    | Leer una reserva que no existe          | 404                                       |
|                                    | Crear con datos incompletos             | **Bug conocido**: responde 500, no 400    |
|                                    | Actualizar sin token                    | 403 y la reserva no cambia                |
|                                    | Actualizar con token                    | 200 y todos los campos nuevos             |
|                                    | Actualizar sin mandar un campo opcional | **Bug conocido**: conserva el valor viejo |
|                                    | Actualización parcial                   | Cambia solo el precio                     |
|                                    | Borrar con token                        | 201 y después 404                         |
|                                    | Borrar con un token inválido            | 403                                       |

Cada test crea su propia reserva (con `bookings.create`), así no depende de otros ni del orden.

## Rarezas de esta API

Los tests prueban lo que la API hace hoy y lo explican en un comentario:

- Con credenciales malas, `/auth` responde **200** con un motivo, no 401.
- Borrar responde **201**, no 200 ni 204.
- El token va en la cookie `token`; el cliente lo arma.

Los dos bugs conocidos se marcan con `test.fail`: si un día la API los corrige, el reporte avisa.

## Correr

```bash
pnpm turbo run test:e2e --filter=restful-booker-api
pnpm --filter restful-booker-api exec playwright test --ui
```

[playwright.config.ts](playwright.config.ts) extiende la base de [libs/utils](../../libs/utils) con un proyecto `api` sin navegador y la cabecera `Accept: application/json`. La `baseURL` la pone [fixtures/restful-booker](../../libs/fixtures/restful-booker).

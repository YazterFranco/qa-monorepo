# api

Clientes de las APIs que se prueban, en una carpeta por producto. Es el equivalente de `pages` para el backend: sabe qué endpoint llamar y cómo armar la petición; no decide qué respuesta es correcta.

```
libs/api/
  response.ts         parseBody(respuesta, esquema): lee el JSON y valida el contrato
  restful-booker/     AuthClient, BookingClient y los esquemas de sus respuestas
```

Se importan por producto: `import { BookingClient } from "api/restful-booker"`.

## Reglas

- **Un cliente por recurso:** `<recurso>.client.ts`, con una clase `<Recurso>Client` que recibe el `request` de Playwright.
- **Devuelven la respuesta cruda** (`APIResponse`). El spec decide qué estado espera, así se pueden probar también los errores (403, 404, 500).
- **Contratos con Zod** en `schemas.ts`. `parseBody` valida el cuerpo antes de usarlo: si la API quita un campo o cambia un tipo, el test falla ahí con el detalle.
- **Sin aserciones** y **sin datos**: reciben lo que mandan como parámetro. No importan `test-data`, `steps`, `fixtures`, `pages` ni `components`; por eso declaran su propio tipo de petición (`BookingPayload`).
- Las rarezas de la API (como el token en una cookie) quedan escondidas en el cliente.

## Ejemplo

[restful-booker/booking.client.ts](restful-booker/booking.client.ts), resumido:

```ts
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async update(id: number, booking: BookingPayload, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeaders(token) });
  }
}
```

En el spec:

```ts
const response = await bookingApi.get(bookingid);

expect(response.status()).toBe(200);
expect(await parseBody(response, bookingResponseSchema)).toEqual(env.bookings.withoutDeposit);
```

## Pruebas

[tests-of-layers/api](../../tests-of-layers/api), con un `request` simulado: qué método, URL, cuerpo y cabeceras manda cada llamada.

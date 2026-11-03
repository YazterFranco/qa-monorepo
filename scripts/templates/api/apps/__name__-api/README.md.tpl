# [[name]]-api

Pruebas de API de `[[name]]` con Playwright (`request`), sin navegador. Generada con `pnpm new:app [[name]] --tipo api`.

## Antes de la primera corrida

1. **URL.** Revisa `baseUrl` en [environments/[[environment]].json](../../libs/test-data/[[name]]/environments/[[environment]].json).
2. **Ruta y respuesta.** [status.client.ts](../../libs/api/[[name]]/status.client.ts) llama a `GET /health`; si tu servicio usa otra ruta, cámbiala ahí. La forma de la respuesta está en [schemas.ts](../../libs/api/[[name]]/schemas.ts).
3. **Texto esperado.** `healthyStatus` en [messages.json](../../libs/test-data/[[name]]/common/messages.json).

## Correr

```bash
export TEST_ENV=[[environment]]
pnpm turbo run test:e2e --filter=[[name]]-api
```

## Cómo seguir

- Un endpoint nuevo: un cliente en `libs/api/[[name]]` con su esquema Zod, y un spec que lo use. El de `libs/api/restful-booker` es un ejemplo completo.
- Servicios con autenticación: agrega el usuario en `environments/[[environment]].json` como `${VAR}` (nunca el valor) y un `AuthClient` como el de restful-booker.
- El esquema valida el contrato: si la API cambia la forma de la respuesta, el test falla con el detalle.

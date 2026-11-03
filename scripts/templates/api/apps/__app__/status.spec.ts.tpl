import { parseBody, statusSchema } from "api/[[name]]";
import { expect, test } from "fixtures/[[name]]";

// Punto de partida: ajusta la ruta en libs/api/[[name]]/status.client.ts y la forma de la
// respuesta en libs/api/[[name]]/schemas.ts.

test("el servicio responde y está sano", async ({ statusApi, env }) => {
  const response = await statusApi.get();

  expect(response.status()).toBe(200);
  const body = await parseBody(response, statusSchema);
  expect(body.status).toBe(env.messages.healthyStatus);
});

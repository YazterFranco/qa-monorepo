import { authFailureSchema, parseBody, tokenSchema } from "api/restful-booker";
import { expect, test } from "fixtures/restful-booker";

test("admin obtiene un token", async ({ authApi, env }) => {
  const response = await authApi.createToken(env.users.admin);

  expect(response.status()).toBe(200);
  const { token } = await parseBody(response, tokenSchema);
  expect(token).not.toHaveLength(0);
});

test("credenciales incorrectas no dan token", async ({ authApi, env }) => {
  const response = await authApi.createToken(env.users.invalid);

  // La API responde 200 con un motivo en vez de 401: se prueba lo que hace hoy.
  expect(response.status()).toBe(200);
  const body = await parseBody(response, authFailureSchema);
  expect(body.reason).toBe(env.messages.badCredentials);
});

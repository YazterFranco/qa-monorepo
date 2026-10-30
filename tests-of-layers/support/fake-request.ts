import type { APIRequestContext } from "@playwright/test";

export interface RecordedCall {
  method: string;
  url: string;
  options: { data?: unknown; params?: unknown; headers?: Record<string, string> };
}

/**
 * APIRequestContext simulado: registra cada llamada y responde con el cuerpo configurado
 * para "MÉTODO /ruta", o con {} y 200 si no hay ninguno.
 */
export function createFakeRequest(
  responses: Record<string, { status?: number; body: unknown }> = {},
) {
  const calls: RecordedCall[] = [];

  const respond =
    (method: string) =>
    (url: string, options: RecordedCall["options"] = {}) => {
      calls.push({ method, url, options });
      const { status = 200, body } = responses[`${method} ${url}`] ?? { body: {} };
      return Promise.resolve({
        status: () => status,
        ok: () => status < 400,
        statusText: () => "",
        url: () => url,
        json: () => Promise.resolve(body),
      });
    };

  const request = {
    get: respond("GET"),
    post: respond("POST"),
    put: respond("PUT"),
    patch: respond("PATCH"),
    delete: respond("DELETE"),
  };

  return { request: request as unknown as APIRequestContext, calls };
}

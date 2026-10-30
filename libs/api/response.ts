import type { APIResponse } from "@playwright/test";
import type { z } from "zod";

/**
 * Lee el cuerpo JSON y lo valida contra el contrato. Si la API cambia la forma de la
 * respuesta, el test falla aquí con el detalle de Zod, no más adelante con un undefined.
 */
export async function parseBody<T extends z.ZodType>(
  response: APIResponse,
  schema: T,
): Promise<z.infer<T>> {
  const body: unknown = await response.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(
      `La respuesta de ${response.url()} no cumple el contrato:\n${result.error.message}`,
    );
  }
  return result.data;
}

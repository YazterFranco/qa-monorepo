import type { APIRequestContext, APIResponse } from "@playwright/test";

export class StatusClient {
  constructor(private readonly request: APIRequestContext) {}

  /** Consulta el estado del servicio. Cambia la ruta si tu servicio usa otra. */
  async get(): Promise<APIResponse> {
    return this.request.get("/health");
  }
}

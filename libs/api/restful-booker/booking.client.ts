import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { BookingPayload } from "./schemas";

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
}

/** Endpoints de /booking. Devuelve la respuesta cruda: el spec decide qué estado espera. */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(filters: BookingFilters = {}): Promise<APIResponse> {
    return this.request.get("/booking", { params: { ...filters } });
  }

  async get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async create(booking: BookingPayload): Promise<APIResponse> {
    return this.request.post("/booking", { data: booking });
  }

  /** Para probar validaciones: manda el cuerpo tal cual, aunque esté incompleto. */
  async createRaw(body: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post("/booking", { data: body });
  }

  async update(id: number, booking: BookingPayload, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeaders(token) });
  }

  async partialUpdate(
    id: number,
    fields: Partial<BookingPayload>,
    token?: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: fields, headers: authHeaders(token) });
  }

  async delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeaders(token) });
  }
}

/** Restful Booker recibe el token en una cookie. Sin token, no se manda nada. */
function authHeaders(token?: string): Record<string, string> {
  return token ? { Cookie: `token=${token}` } : {};
}

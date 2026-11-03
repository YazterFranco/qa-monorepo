import { z } from "zod";

/** Contrato de la respuesta de estado. Ajústalo a lo que devuelve tu servicio. */
export const statusSchema = z.object({
  status: z.string(),
});

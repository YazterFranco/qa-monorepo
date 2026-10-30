import { z } from "zod";

// Contratos de las respuestas de Restful Booker.

export const bookingResponseSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.iso.date(), checkout: z.iso.date() }),
  additionalneeds: z.string().optional(),
});

export const createdBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingResponseSchema,
});

export const bookingIdsSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const tokenSchema = z.object({ token: z.string().min(1) });

/** Con credenciales malas la API responde 200 con este cuerpo, en vez de 401. */
export const authFailureSchema = z.object({ reason: z.string() });

export type BookingPayload = z.infer<typeof bookingResponseSchema>;
export type CreatedBooking = z.infer<typeof createdBookingSchema>;

import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  postalCode: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const bookingSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.iso.date(), checkout: z.iso.date() }),
  additionalneeds: z.string().optional(),
});

// Estricto: una clave desconocida (por ejemplo, common/costumers.json) falla en vez de perderse.
export const environmentSchema = z.strictObject({
  // Opcional porque una app móvil no tiene URL; las fixtures web fallan si falta.
  baseUrl: z.url().optional(),
  users: z.record(z.string(), userSchema),
  messages: z.record(z.string(), z.string()).default({}),
  customers: z.record(z.string(), customerSchema).default({}),
  products: z.record(z.string(), productSchema).default({}),
  bookings: z.record(z.string(), bookingSchema).default({}),
});

export type User = z.infer<typeof userSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Product = z.infer<typeof productSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Environment = z.infer<typeof environmentSchema>;

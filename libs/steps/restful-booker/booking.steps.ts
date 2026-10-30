import type { APIRequestContext } from "@playwright/test";
import {
  BookingClient,
  createdBookingSchema,
  parseBody,
  type CreatedBooking,
} from "api/restful-booker";
import type { Booking } from "test-data";

/** Preparación de datos por API: crea lo que un test necesita sin pasar por la interfaz. */
export class BookingSteps {
  constructor(private readonly request: APIRequestContext) {}

  async create(booking: Booking): Promise<CreatedBooking> {
    const response = await new BookingClient(this.request).create(booking);
    if (!response.ok()) {
      throw new Error(
        `No se pudo crear la reserva: ${response.status()} ${response.statusText()}.`,
      );
    }
    return parseBody(response, createdBookingSchema);
  }
}

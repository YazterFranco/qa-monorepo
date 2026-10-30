import {
  bookingIdsSchema,
  bookingResponseSchema,
  createdBookingSchema,
  parseBody,
} from "api/restful-booker";
import { expect, test } from "fixtures/restful-booker";

test.describe("crear y leer", () => {
  test("crear una reserva devuelve su id y los mismos datos", async ({ bookingApi, env }) => {
    const response = await bookingApi.create(env.bookings.standard);

    expect(response.status()).toBe(200);
    // parseBody valida el contrato: si falta un campo o cambia un tipo, el test falla aquí.
    const { bookingid, booking } = await parseBody(response, createdBookingSchema);
    expect(bookingid).toBeGreaterThan(0);
    expect(booking).toEqual(env.bookings.standard);
  });

  test("la reserva creada se lee por su id", async ({ bookingApi, bookings, env }) => {
    const { bookingid } = await bookings.create(env.bookings.withoutDeposit);

    const response = await bookingApi.get(bookingid);

    expect(response.status()).toBe(200);
    expect(await parseBody(response, bookingResponseSchema)).toEqual(env.bookings.withoutDeposit);
  });

  test("buscar por nombre encuentra la reserva", async ({ bookingApi, bookings, env }) => {
    const booking = env.bookings.standard;
    const { bookingid } = await bookings.create(booking);

    const response = await bookingApi.list({
      firstname: booking.firstname,
      lastname: booking.lastname,
    });

    const ids = await parseBody(response, bookingIdsSchema);
    expect(ids).toContainEqual({ bookingid });
  });

  test("una reserva que no existe responde 404", async ({ bookingApi }) => {
    const response = await bookingApi.get(999_999_999);

    expect(response.status()).toBe(404);
  });

  test("crear con datos incompletos responde 400", async ({ bookingApi }) => {
    test.fail(true, "Bug conocido de Restful Booker: responde 500 en vez de 400");

    const response = await bookingApi.createRaw({ firstname: "Ana" });

    expect(response.status()).toBe(400);
  });
});

test.describe("modificar y borrar", () => {
  test("actualizar sin token responde 403 y no cambia nada", async ({
    bookingApi,
    bookings,
    env,
  }) => {
    const { bookingid, booking } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.update(bookingid, { ...booking, firstname: "Eva" });

    expect(response.status()).toBe(403);
    const current = await parseBody(await bookingApi.get(bookingid), bookingResponseSchema);
    expect(current.firstname).toBe(booking.firstname);
  });

  test("actualizar con token cambia todos los campos", async ({
    auth,
    bookingApi,
    bookings,
    env,
  }) => {
    const token = await auth.tokenFor("admin");
    const { bookingid } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.update(bookingid, env.bookings.rescheduled, token);

    expect(response.status()).toBe(200);
    expect(await parseBody(response, bookingResponseSchema)).toEqual(env.bookings.rescheduled);
  });

  test("actualizar quita los campos que no se mandan", async ({
    auth,
    bookingApi,
    bookings,
    env,
  }) => {
    test.fail(true, "Bug de Restful Booker: PUT conserva additionalneeds si no se manda");
    const token = await auth.tokenFor("admin");
    const { bookingid } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.update(bookingid, env.bookings.withoutDeposit, token);

    expect(await parseBody(response, bookingResponseSchema)).toEqual(env.bookings.withoutDeposit);
  });

  test("la actualización parcial cambia solo el precio", async ({
    auth,
    bookingApi,
    bookings,
    env,
  }) => {
    const token = await auth.tokenFor("admin");
    const { bookingid, booking } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.partialUpdate(bookingid, { totalprice: 99 }, token);

    expect(response.status()).toBe(200);
    expect(await parseBody(response, bookingResponseSchema)).toEqual({
      ...booking,
      totalprice: 99,
    });
  });

  test("borrar con token elimina la reserva", async ({ auth, bookingApi, bookings, env }) => {
    const token = await auth.tokenFor("admin");
    const { bookingid } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.delete(bookingid, token);

    // La API responde 201 al borrar, en vez de 200 o 204.
    expect(response.status()).toBe(201);
    expect((await bookingApi.get(bookingid)).status()).toBe(404);
  });

  test("borrar con un token inválido responde 403", async ({ bookingApi, bookings, env }) => {
    const { bookingid } = await bookings.create(env.bookings.standard);

    const response = await bookingApi.delete(bookingid, "token-invalido");

    expect(response.status()).toBe(403);
  });
});

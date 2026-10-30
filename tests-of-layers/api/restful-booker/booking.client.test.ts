import { expect, test } from "@playwright/test";
import { BookingClient } from "api/restful-booker";
import { createFakeRequest } from "../../support/fake-request";

const booking = {
  firstname: "Ana",
  lastname: "Pérez",
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: "2026-12-01", checkout: "2026-12-05" },
};

test.describe("api: BookingClient de restful-booker", () => {
  test("manda el token en la cookie que espera la API", async () => {
    const { request, calls } = createFakeRequest();

    await new BookingClient(request).update(7, booking, "abc123");

    expect(calls).toEqual([
      {
        method: "PUT",
        url: "/booking/7",
        options: { data: booking, headers: { Cookie: "token=abc123" } },
      },
    ]);
  });

  test("sin token no manda la cookie", async () => {
    const { request, calls } = createFakeRequest();

    await new BookingClient(request).delete(7);

    expect(calls[0]?.options.headers).toEqual({});
  });

  test("list pasa los filtros como parámetros de la URL", async () => {
    const { request, calls } = createFakeRequest();

    await new BookingClient(request).list({ firstname: "Ana" });

    expect(calls[0]).toMatchObject({ url: "/booking", options: { params: { firstname: "Ana" } } });
  });
});

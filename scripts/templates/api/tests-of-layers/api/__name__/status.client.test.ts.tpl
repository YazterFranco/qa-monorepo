import { expect, test } from "@playwright/test";
import { StatusClient } from "api/[[name]]";
import { createFakeRequest } from "../../support/fake-request";

test.describe("api: StatusClient de [[name]]", () => {
  test("get pide el estado con un GET", async () => {
    const { request, calls } = createFakeRequest();

    const response = await new StatusClient(request).get();

    expect(response.status()).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe("GET");
  });
});

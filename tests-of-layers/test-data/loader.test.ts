import path from "node:path";
import { expect, test } from "@playwright/test";
import { loadEnvironment } from "test-data";

const samples = path.join(__dirname, "samples");

test.describe("test-data: loadEnvironment", () => {
  test("carga public-demo y cumple el esquema", () => {
    const env = loadEnvironment("public-demo");

    expect(env.baseUrl).toBe("https://the-internet.herokuapp.com");
    expect(env.users.standard?.username).toBeTruthy();
    expect(env.messages.loginSuccess).toBeTruthy();
  });

  test("rechaza un ambiente con baseUrl inválida", () => {
    expect(() => loadEnvironment("invalid-base-url", { directory: samples })).toThrow(
      /no cumple el esquema/,
    );
  });

  test("rechaza un ambiente sin usuarios", () => {
    expect(() => loadEnvironment("without-users", { directory: samples })).toThrow(
      /no cumple el esquema/,
    );
  });

  test("resuelve ${VAR} con las variables de entorno", () => {
    const env = loadEnvironment("with-secret-reference", {
      directory: samples,
      variables: { QA_STANDARD_PASSWORD: "valor-desde-el-ci" },
    });

    expect(env.users.standard?.password).toBe("valor-desde-el-ci");
  });

  test("falla si falta una variable referenciada", () => {
    expect(() =>
      loadEnvironment("with-secret-reference", { directory: samples, variables: {} }),
    ).toThrow("Falta la variable de entorno QA_STANDARD_PASSWORD.");
  });

  test("lista los ambientes disponibles si el pedido no existe", () => {
    expect(() => loadEnvironment("produccion", { directory: samples })).toThrow(
      /No existe el ambiente "produccion"\. Disponibles: .*without-users/,
    );
  });

  test("rechaza nombres de ambiente que salen de la carpeta", () => {
    expect(() => loadEnvironment("../secrets")).toThrow(/Nombre de ambiente inválido/);
  });
});

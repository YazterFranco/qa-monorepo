import path from "node:path";
import { expect, test } from "@playwright/test";
import { loadEnvironment } from "test-data";

// samples/ imita la estructura de libs/test-data con un producto de prueba llamado "sample".
const root = path.join(__dirname, "samples");

test.describe("test-data: datos reales", () => {
  test("carga the-internet en public-demo", () => {
    const env = loadEnvironment("the-internet", "public-demo");

    expect(env.baseUrl).toBe("https://the-internet.herokuapp.com");
    expect(env.users.standard?.username).toBeTruthy();
    expect(env.messages.loginSuccess).toBeTruthy();
  });

  test("carga saucedemo en public-demo con sus datos de common/", () => {
    const env = loadEnvironment("saucedemo", "public-demo");

    expect(env.baseUrl).toBe("https://www.saucedemo.com");
    expect(Object.keys(env.users)).toContain("lockedOut");
    expect(env.customers.standard?.postalCode).toBeTruthy();
    expect(env.products.backpack?.name).toBe("Sauce Labs Backpack");
    expect(env.messages.orderComplete).toBeTruthy();
  });
});

test.describe("test-data: loadEnvironment", () => {
  test("combina common/ con el ambiente, y el ambiente gana", () => {
    const env = loadEnvironment("sample", "with-common-override", { root });

    expect(env.messages).toEqual({ greeting: "Hola", farewell: "Adiós" });
  });

  test("rechaza un ambiente con baseUrl inválida", () => {
    expect(() => loadEnvironment("sample", "invalid-base-url", { root })).toThrow(
      /no cumple el esquema/,
    );
  });

  test("rechaza un ambiente sin usuarios", () => {
    expect(() => loadEnvironment("sample", "without-users", { root })).toThrow(
      /no cumple el esquema/,
    );
  });

  test("rechaza claves desconocidas, como un nombre de archivo mal escrito", () => {
    expect(() => loadEnvironment("sample", "with-unknown-key", { root })).toThrow(/costumers/);
  });

  test("resuelve ${VAR} con las variables de entorno", () => {
    const env = loadEnvironment("sample", "with-secret-reference", {
      root,
      variables: { QA_STANDARD_PASSWORD: "valor-desde-el-ci" },
    });

    expect(env.users.standard?.password).toBe("valor-desde-el-ci");
  });

  test("falla si falta una variable referenciada", () => {
    expect(() =>
      loadEnvironment("sample", "with-secret-reference", { root, variables: {} }),
    ).toThrow("Falta la variable de entorno QA_STANDARD_PASSWORD.");
  });

  test("lista los ambientes disponibles si el pedido no existe", () => {
    expect(() => loadEnvironment("sample", "produccion", { root })).toThrow(
      /No existe el ambiente "produccion" de "sample"\. Disponibles: .*without-users/,
    );
  });

  test("lista los productos disponibles si el pedido no existe", () => {
    expect(() => loadEnvironment("tienda", "public-demo")).toThrow(
      /No existe el producto "tienda"\. Disponibles: .*saucedemo.*the-internet/,
    );
  });

  test("rechaza nombres que salen de la carpeta", () => {
    expect(() => loadEnvironment("the-internet", "../secrets")).toThrow(
      /Nombre de ambiente inválido/,
    );
    expect(() => loadEnvironment("../saucedemo")).toThrow(/Nombre de producto inválido/);
  });
});

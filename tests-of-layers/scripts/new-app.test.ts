import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { loadEnvironment } from "test-data";

// Genera cada tipo de producto en una copia mínima del repo y comprueba que lo creado cumple
// el esquema de datos y que queda registrado. Así una plantilla rota falla aquí, no cuando
// alguien la usa por primera vez.
const repoRoot = path.resolve(__dirname, "../..");
const script = path.join(repoRoot, "scripts", "new-app.mjs");
const REGISTERED_FILES = [
  "docker/run-tests.sh",
  "docker/summary.mjs",
  ".circleci/config.yml",
  "eslint.config.mjs",
];

function createRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "new-app-"));
  for (const file of REGISTERED_FILES) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    cpSync(path.join(repoRoot, file), path.join(root, file));
  }
  return root;
}

function generate(root: string, ...args: string[]): string {
  return execFileSync(process.execPath, [script, ...args, "--raiz", root, "--sin-formato"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function read(root: string, file: string): string {
  return readFileSync(path.join(root, file), "utf8");
}

/** Define cada ${VAR} que usa el ambiente, para poder cargarlo con el cargador real. */
function variablesOf(root: string, product: string, environment: string): NodeJS.ProcessEnv {
  const text = read(root, `libs/test-data/${product}/environments/${environment}.json`);
  return Object.fromEntries(
    [...text.matchAll(/\$\{([A-Z0-9_]+)\}/g)].map(([, name]) => [name, "x"]),
  );
}

const products = [
  { type: "web", name: "mi-tienda", app: "mi-tienda-e2e", files: ["login.spec.ts"] },
  { type: "api", name: "mi-servicio", app: "mi-servicio-api", files: ["status.spec.ts"] },
  { type: "android", name: "mi-app", app: "mi-app-e2e", files: ["login.spec.ts", "wdio.conf.ts"] },
];

test.describe("scripts: new-app", () => {
  for (const { type, name, app, files } of products) {
    test(`crea un producto ${type} con datos válidos y sin valores sin reemplazar`, () => {
      const root = createRoot();
      try {
        generate(root, name, "--tipo", type, "--url", "https://staging.example.org");

        for (const file of files) {
          expect(existsSync(path.join(root, "apps", app, file))).toBe(true);
        }
        for (const file of ["package.json", "tsconfig.json"]) {
          expect(read(root, `apps/${app}/${file}`)).not.toContain("[[");
          expect(() => JSON.parse(read(root, `apps/${app}/${file}`))).not.toThrow();
        }

        const env = loadEnvironment(name, "staging", {
          root: path.join(root, "libs", "test-data"),
          variables: variablesOf(root, name, "staging"),
        });
        expect(Object.keys(env.messages).length).toBeGreaterThan(0);
        // Una app móvil no tiene URL base.
        expect(env.baseUrl).toBe(type === "android" ? undefined : "https://staging.example.org");

        for (const file of files) {
          expect(read(root, `apps/${app}/${file}`)).not.toContain("[[");
        }
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  }

  test("registra web y API en Docker y CI, y Android en las reglas de ESLint", () => {
    const root = createRoot();
    try {
      generate(root, "mi-tienda", "--tipo", "web");
      generate(root, "mi-servicio", "--tipo", "api");
      generate(root, "mi-app", "--tipo", "android");

      expect(read(root, "docker/run-tests.sh")).toContain(
        "apps/mi-tienda-e2e apps/mi-servicio-api",
      );
      expect(read(root, "docker/summary.mjs")).toContain('"mi-servicio-api": "API · mi-servicio"');
      const ci = read(root, ".circleci/config.yml");
      expect(ci.match(/mi-tienda-e2e/g)).toHaveLength(2);
      expect(ci.match(/mi-servicio-api/g)).toHaveLength(2);
      expect(ci).not.toContain("mi-app-e2e");
      expect(read(root, "eslint.config.mjs")).toContain('"libs/*/mi-app/**"');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("no sobrescribe un producto que ya existe", () => {
    const root = createRoot();
    try {
      generate(root, "mi-tienda", "--tipo", "web");

      expect(() => generate(root, "mi-tienda", "--tipo", "web")).toThrow(/ya existe/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rechaza un nombre o un tipo inválidos", () => {
    const root = createRoot();
    try {
      expect(() => generate(root, "MiTienda", "--tipo", "web")).toThrow(/Nombre inválido/);
      expect(() => generate(root, "mi-tienda", "--tipo", "escritorio")).toThrow(/--tipo/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

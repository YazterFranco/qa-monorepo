import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

// Usa una raíz mínima con el mismo formato que los archivos reales, y no una copia del repo:
// así la prueba sigue sirviendo cuando alguien ya quitó los ejemplos del suyo.
const script = path.resolve(__dirname, "../../scripts/remove-examples.mjs");

const FILES: Record<string, string> = {
  "docker/run-tests.sh": "PACKAGES=(tests-of-layers apps/the-internet-e2e apps/mi-tienda-e2e)\n",
  "docker/summary.mjs": [
    "const DESCRIPTIONS = {",
    '  "tests-of-layers": "Capas",',
    '  "the-internet-e2e": "Web · the-internet",',
    '  "mi-tienda-e2e": "Web · mi-tienda",',
    "};",
    "",
  ].join("\n"),
  ".circleci/config.yml": [
    "              app: [the-internet-e2e, mi-tienda-e2e]",
    "              app:",
    "                [",
    "                  the-internet-e2e,",
    "                  saucedemo-e2e,",
    "                  mi-tienda-e2e,",
    "                ]",
    "",
  ].join("\n"),
  "eslint.config.mjs":
    'const MOBILE = ["apps/my-demo-app-e2e/**", "libs/*/my-demo-app/**", "apps/mi-movil-e2e/**"];\n',
  "tests-of-layers/test-data/loader.test.ts": [
    'test.describe("test-data: datos reales", () => {',
    '  test("carga the-internet", () => {});',
    "});",
    "",
    'test.describe("test-data: loadEnvironment", () => {});',
    "",
  ].join("\n"),
  "apps/the-internet-e2e/package.json": "{}\n",
  "apps/mi-tienda-e2e/package.json": "{}\n",
  "libs/pages/the-internet/index.ts": "export {};\n",
  "libs/pages/mi-tienda/index.ts": "export {};\n",
  "tests-of-layers/pages/the-internet/login.page.test.ts": "export {};\n",
};

function createRoot(files: Record<string, string> = FILES): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "remove-examples-"));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

function run(root: string, ...args: string[]): string {
  return execFileSync(process.execPath, [script, "--raiz", root, "--sin-formato", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function read(root: string, file: string): string {
  return readFileSync(path.join(root, file), "utf8");
}

test.describe("scripts: remove-examples", () => {
  test("sin --confirmar muestra lo que haría y no cambia nada", () => {
    const root = createRoot();
    try {
      const output = run(root);

      expect(output).toContain("apps/the-internet-e2e");
      expect(existsSync(path.join(root, "apps/the-internet-e2e"))).toBe(true);
      expect(read(root, "docker/run-tests.sh")).toContain("the-internet-e2e");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("con --confirmar borra los ejemplos, los saca de los registros y conserva lo tuyo", () => {
    const root = createRoot();
    try {
      run(root, "--confirmar");

      for (const gone of [
        "apps/the-internet-e2e",
        "libs/pages/the-internet",
        "tests-of-layers/pages/the-internet",
      ]) {
        expect(existsSync(path.join(root, gone))).toBe(false);
      }
      for (const kept of ["apps/mi-tienda-e2e", "libs/pages/mi-tienda"]) {
        expect(existsSync(path.join(root, kept))).toBe(true);
      }

      expect(read(root, "docker/run-tests.sh")).toBe(
        "PACKAGES=(tests-of-layers apps/mi-tienda-e2e)\n",
      );
      expect(read(root, "docker/summary.mjs")).not.toContain("the-internet-e2e");
      expect(read(root, "docker/summary.mjs")).toContain('"mi-tienda-e2e"');
      const ci = read(root, ".circleci/config.yml");
      expect(ci).not.toContain("the-internet-e2e");
      expect(ci).not.toContain("saucedemo-e2e");
      expect(ci.match(/mi-tienda-e2e/g)).toHaveLength(2);
      expect(read(root, "eslint.config.mjs")).toBe('const MOBILE = ["apps/mi-movil-e2e/**"];\n');
      expect(read(root, "tests-of-layers/test-data/loader.test.ts")).not.toContain("datos reales");
      expect(read(root, "tests-of-layers/test-data/loader.test.ts")).toContain("loadEnvironment");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("se niega y no borra nada si todavía no hay un producto propio", () => {
    const root = createRoot({
      ...FILES,
      "docker/run-tests.sh": "PACKAGES=(tests-of-layers apps/the-internet-e2e)\n",
    });
    try {
      expect(() => run(root, "--confirmar")).toThrow(/Todavía no hay un producto propio/);
      expect(existsSync(path.join(root, "apps/the-internet-e2e"))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

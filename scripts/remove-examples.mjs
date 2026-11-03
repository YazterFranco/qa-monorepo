// Quita los cuatro productos de demostración (the-internet, saucedemo, restful-booker y
// my-demo-app) y los saca de Docker, CI y ESLint. Sirve cuando ya creaste tu propio producto con
// `pnpm new:app` y no quieres arrastrar los ejemplos.
// Uso: pnpm remove:examples [--confirmar]. Sin --confirmar solo muestra lo que haría.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { removeItems } from "./lib/lists.mjs";

const EXAMPLES = ["the-internet", "saucedemo", "restful-booker", "my-demo-app"];
const EXAMPLE_APPS = ["the-internet-e2e", "saucedemo-e2e", "restful-booker-api", "my-demo-app-e2e"];
const LAYER_FOLDERS = [
  "libs/pages",
  "libs/steps",
  "libs/fixtures",
  "libs/test-data",
  "libs/components",
  "libs/api",
  "tests-of-layers/pages",
  "tests-of-layers/steps",
  "tests-of-layers/components",
  "tests-of-layers/api",
];
// Archivos de texto donde puede quedar una mención a los ejemplos. docs/empezar.md los nombra a
// propósito, docs/reporte-ejemplo es una foto histórica y las plantillas no son del repo vivo.
const TEXT_FILE = /\.(ts|mjs|json|md|ya?ml|sh|html)$|^(\.dockerignore|Dockerfile)$/;
const SKIP_FOLDERS = new Set(["node_modules", ".git", ".turbo", "reporte-ejemplo", "templates"]);
const SKIP_FILES = new Set(["pnpm-lock.yaml", "empezar.md", "remove-examples.mjs"]);

const HELP = `Uso: pnpm remove:examples [--confirmar] [--sin-formato]

Quita los productos de demostración y los saca de Docker, CI y ESLint.
Sin --confirmar solo muestra lo que haría. Antes crea tu propio producto con pnpm new:app:
el comando se niega si no hay al menos uno web o de API, porque el CI quedaría vacío.`;

function main() {
  const { values } = parseArgs({
    options: {
      confirmar: { type: "boolean", default: false },
      "sin-formato": { type: "boolean", default: false },
      raiz: { type: "string" },
      ayuda: { type: "boolean", default: false },
    },
  });
  if (values.ayuda) {
    console.log(HELP);
    return;
  }

  try {
    run({
      root: path.resolve(values.raiz ?? path.join(import.meta.dirname, "..")),
      apply: values.confirmar,
      format: !values["sin-formato"],
    });
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

function run({ root, apply, format }) {
  assertOwnProduct(root);

  const folders = [
    ...EXAMPLE_APPS.map((app) => `apps/${app}`),
    ...LAYER_FOLDERS.flatMap((layer) => EXAMPLES.map((example) => `${layer}/${example}`)),
  ].filter((folder) => existsSync(path.join(root, folder)));

  // Se calcula todo antes de tocar el disco: si algo falla, no se borra nada.
  const edits = EDITS.map((edit) => {
    const file = path.join(root, edit.file);
    const result = existsSync(file)
      ? edit.apply(readFileSync(file, "utf8"))
      : { status: "no encontrado" };
    return { ...edit, ...result };
  });

  console.log(`${apply ? "Borrando" : "Se borrarían"} ${folders.length} carpetas:`);
  for (const folder of folders) {
    console.log(`  - ${folder}`);
    if (apply) {
      rmSync(path.join(root, folder), { recursive: true, force: true });
    }
  }

  if (apply) {
    // tests-of-layers/<capa> puede quedar vacía; git no guarda carpetas vacías.
    for (const layer of LAYER_FOLDERS.filter((folder) => folder.startsWith("tests-of-layers/"))) {
      const folder = path.join(root, layer);
      if (existsSync(folder) && readdirSync(folder).length === 0) {
        rmSync(folder, { recursive: true });
      }
    }
  }

  console.log(`\n${apply ? "Editando" : "Se editarían"} los registros:`);
  const touched = [];
  for (const edit of edits) {
    const symbol = { cambiado: "~", "ya estaba": "=", "no encontrado": "!" }[edit.status];
    console.log(`  ${symbol} ${edit.file}: ${edit.what}`);
    if (edit.status === "no encontrado") {
      console.log(`      No encontré dónde. Hazlo a mano: ${edit.manual}`);
    }
    if (edit.status === "cambiado" && apply) {
      writeFileSync(path.join(root, edit.file), edit.text);
      touched.push(edit.file);
    }
  }

  if (!apply) {
    console.log("\nNo se cambió nada. Corre `pnpm remove:examples --confirmar` para aplicarlo.");
    return;
  }
  if (format) {
    formatFiles(root, touched);
  }
  printNextSteps(root);
}

/** Se niega si el CI quedaría sin ningún producto propio. */
function assertOwnProduct(root) {
  const runner = path.join(root, "docker", "run-tests.sh");
  const registered = existsSync(runner)
    ? (readFileSync(runner, "utf8").match(/^PACKAGES=\(([^)\n]*)\)$/m)?.[1] ?? "")
        .split(/\s+/)
        .filter((entry) => entry.startsWith("apps/") && !EXAMPLE_APPS.includes(entry.slice(5)))
    : [];
  if (registered.length === 0) {
    throw new Error(
      "Todavía no hay un producto propio web o de API. Créalo primero, por ejemplo:\n" +
        "  pnpm new:app mi-producto --tipo web\n" +
        "Si no, el CI quedaría sin ninguna app que correr.",
    );
  }
}

const EDITS = [
  {
    file: "docker/run-tests.sh",
    what: "paquetes del reporte de Docker",
    manual: "quita los ejemplos de PACKAGES",
    apply: (text) =>
      editMatches(text, /^(PACKAGES=\()([^)\n]*)(\))$/gm, (body) =>
        removeItems(
          body,
          EXAMPLE_APPS.map((app) => `apps/${app}`),
          " ",
        ),
      ),
  },
  {
    file: "docker/summary.mjs",
    what: "nombres en el resumen del reporte",
    manual: "quita los ejemplos de DESCRIPTIONS",
    apply: (text) => {
      const updated = EXAMPLE_APPS.reduce(
        (current, app) => current.replace(new RegExp(`^  "${app}": "[^"]*",\\n`, "m"), ""),
        text,
      );
      return updated === text
        ? { text, status: "ya estaba" }
        : { text: updated, status: "cambiado" };
    },
  },
  {
    file: ".circleci/config.yml",
    what: "las dos listas app: de los workflows",
    manual: "quita los ejemplos de las dos listas app: [...]",
    apply: (text) => {
      const single = editMatches(text, /^(\s*app: \[)([^\]\n]+)(\])$/gm, (body) =>
        removeItems(body, EXAMPLE_APPS),
      );
      return editMatches(
        single.text,
        /^(\s*app:\n\s*\[\n)((?:[ ]+[\w-]+,\n)+)([ ]*\])$/gm,
        (body) => removeItems(body, EXAMPLE_APPS),
        single.status,
      );
    },
  },
  {
    file: "eslint.config.mjs",
    what: "reglas de WebdriverIO de la app móvil de ejemplo",
    manual: "quita las rutas de my-demo-app de la lista MOBILE",
    apply: (text) =>
      editMatches(text, /^(const MOBILE = \[)([^\]]*)(\];)$/gm, (body) =>
        removeItems(body, ['"apps/my-demo-app-e2e/**"', '"libs/*/my-demo-app/**"']),
      ),
  },
  {
    file: "tests-of-layers/test-data/loader.test.ts",
    what: "pruebas que cargan los datos de los ejemplos",
    manual: 'borra el bloque test.describe("test-data: datos reales")',
    apply: (text) => {
      const block = /test\.describe\("test-data: datos reales"[\s\S]*?\n\}\);\n\n/;
      return block.test(text)
        ? { text: text.replace(block, ""), status: "cambiado" }
        : { text, status: "ya estaba" };
    },
  },
];

/**
 * Aplica `change` al cuerpo de cada lista que coincide. `previous` es el resultado de una pasada
 * anterior sobre el mismo archivo, para no declarar "no encontrado" lo que otra pasada ya halló.
 */
function editMatches(text, pattern, change, previous = "no encontrado") {
  if (previous === "no encontrado" && !text.match(pattern)) {
    return { text, status: "no encontrado" };
  }
  let changed = previous === "cambiado";
  const updated = text.replace(pattern, (line, open, body, close) => {
    const next = change(body);
    if (next === body) {
      return line;
    }
    changed = true;
    return `${open}${next}${close}`;
  });
  return { text: updated, status: changed ? "cambiado" : "ya estaba" };
}

function formatFiles(root, files) {
  const formattable = files.filter((file) => /\.(ts|mjs|json|md|ya?ml)$/.test(file));
  try {
    execFileSync("pnpm", ["exec", "prettier", "--write", "--log-level", "warn", ...formattable], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"],
    });
  } catch {
    console.log("\nNo pude correr Prettier. Corre `pnpm format` antes de hacer commit.");
  }
}

function printNextSteps(root) {
  const leftovers = findMentions(root);
  const ci = path.join(root, ".circleci", "config.yml");
  const mobileStillPointsAtExample =
    existsSync(ci) && readFileSync(ci, "utf8").includes("my-demo-app-e2e");

  console.log("\nSiguientes pasos:");
  const steps = [
    "Corre `pnpm install`: saca los paquetes borrados del workspace y actualiza " +
      "pnpm-lock.yaml. Haz commit del lockfile.",
    "Corre `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y `pnpm test:layers`.",
  ];
  if (mobileStillPointsAtExample) {
    steps.push(
      "El workflow mobile de .circleci/config.yml (job e2e-mobile-browserstack) todavía usa " +
        "my-demo-app-e2e. Cambia su --filter por tu app Android, o borra el workflow.",
    );
  }
  if (leftovers.length > 0) {
    steps.push(
      "Estos archivos todavía nombran los ejemplos, casi siempre como ejemplo en la " +
        `documentación. Revísalos y cámbialos por tu producto:\n       ${leftovers.join("\n       ")}`,
    );
  }
  steps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
}

/** Archivos de texto que todavía mencionan un ejemplo. */
function findMentions(root, directory = root) {
  return readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) {
      return SKIP_FOLDERS.has(name) ? [] : findMentions(root, full);
    }
    if (SKIP_FILES.has(name) || !TEXT_FILE.test(name)) {
      return [];
    }
    const text = readFileSync(full, "utf8");
    return EXAMPLES.some((example) => text.includes(example))
      ? [path.relative(root, full).split(path.sep).join("/")]
      : [];
  });
}

main();

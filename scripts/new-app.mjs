// Crea un producto nuevo con todas sus capas (datos, pages, steps, fixtures, app y pruebas de
// capas) y lo registra en Docker y CI. Las plantillas están en scripts/templates/<tipo>.
// Uso: pnpm new:app <nombre> --tipo web|api|android|web,api,...|todos [opciones].
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { parseArgs } from "node:util";
import { appendItems, hasItem } from "./lib/lists.mjs";

// suffix: sufijo de la carpeta de la app. word: cómo se nombra el producto cuando se crean
// varios tipos a la vez (<nombre>-web, <nombre>-api, <nombre>-movil).
const TYPES = {
  web: { suffix: "e2e", word: "web", label: "Web" },
  api: { suffix: "api", word: "api", label: "API" },
  android: { suffix: "e2e", word: "movil", label: "App Android" },
};
const ALL_TYPES = ["web", "api", "android"];
const DEFAULT_URL = "https://staging.example.com";
const DEFAULT_ENVIRONMENT = "staging";

const HELP = `Uso: pnpm new:app <nombre> --tipo <tipos> [opciones]

Crea un producto nuevo con sus capas y lo registra en Docker y CI.

  <nombre>            minúsculas, números y guiones; empieza con letra (por ejemplo, mi-tienda)
  --tipo              web, api, android, varios separados por coma (web,api) o todos (obligatorio)
                      Con varios tipos, cada producto se llama <nombre>-web, <nombre>-api y
                      <nombre>-movil. Con un solo tipo, se llama <nombre> tal cual.
  --url               URL base de la web o la API (por defecto ${DEFAULT_URL})
  --ambiente          nombre del ambiente de datos (por defecto ${DEFAULT_ENVIRONMENT})
  --paquete           applicationId de la app Android (por defecto com.example.<nombre>)
  --dry-run           muestra qué haría, sin escribir nada
  --sin-formato       no corre Prettier sobre lo generado
  --ayuda             muestra esta ayuda`;

main();

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      tipo: { type: "string" },
      url: { type: "string" },
      ambiente: { type: "string" },
      paquete: { type: "string" },
      raiz: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      "sin-formato": { type: "boolean", default: false },
      ayuda: { type: "boolean", default: false },
    },
  });

  if (values.ayuda) {
    console.log(HELP);
    return;
  }

  try {
    run(validate(positionals, values));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    console.error("Con --ayuda ves todas las opciones.");
    process.exitCode = 1;
  }
}

/** Comprueba los argumentos y devuelve lo que necesita cada producto. */
function validate(positionals, values) {
  const [name, ...extra] = positionals;
  if (!name || extra.length > 0) {
    throw new Error(
      "Indica un solo nombre de producto, por ejemplo: pnpm new:app mi-tienda --tipo todos",
    );
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `Nombre inválido: "${name}". Usa minúsculas, números y guiones, y empieza con una letra.`,
    );
  }

  const types = parseTypes(values.tipo);

  const environment = values.ambiente ?? DEFAULT_ENVIRONMENT;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(environment)) {
    throw new Error(`Ambiente inválido: "${environment}". Usa minúsculas, números y guiones.`);
  }

  const url = values.url ?? DEFAULT_URL;
  assertUrl(url);

  if (
    values.paquete !== undefined &&
    !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(values.paquete)
  ) {
    throw new Error(`Paquete inválido: "${values.paquete}". Ejemplo: com.empresa.app.`);
  }

  return {
    base: name,
    types,
    multi: types.length > 1,
    root: path.resolve(values.raiz ?? path.join(import.meta.dirname, "..")),
    dryRun: values["dry-run"],
    format: !values["sin-formato"],
    url,
    environment,
    usesDefaultUrl: values.url === undefined,
    userPackage: values.paquete ?? null,
  };
}

function parseTypes(value) {
  const hint = "Usa web, api, android, varios separados por coma (web,api) o todos.";
  if (!value) {
    throw new Error(`Falta --tipo. ${hint}`);
  }
  const requested = value === "todos" ? ALL_TYPES : value.split(",").map((item) => item.trim());
  const invalid = requested.find((item) => !Object.hasOwn(TYPES, item));
  if (invalid !== undefined) {
    throw new Error(`Tipo no válido: "${invalid}". ${hint}`);
  }
  return [...new Set(requested)];
}

/** Un producto por tipo: nombre, carpeta de la app y valores que se reemplazan en las plantillas. */
function buildPlans(options) {
  const { base, types, multi, url, environment, userPackage, root } = options;
  return types.map((type) => {
    const { suffix, word } = TYPES[type];
    const name = multi ? `${base}-${word}` : base;
    // Si el nombre ya termina en el sufijo (mi-api, de tipo api), no se repite (mi-api-api).
    const app = name.endsWith(`-${suffix}`) ? name : `${name}-${suffix}`;
    return {
      type,
      name,
      app,
      root,
      usesDefaultUrl: options.usesDefaultUrl,
      environment,
      tokens: {
        name,
        app,
        camel: name.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase()),
        ENV_PREFIX: name.toUpperCase().replaceAll("-", "_"),
        url,
        environment,
        package: userPackage ?? `com.example.${name.replaceAll("-", "")}`,
      },
    };
  });
}

function assertUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`URL inválida: "${value}". Ejemplo: https://staging.example.com`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`La URL debe empezar con http:// o https://: "${value}".`);
  }
}

function run(options) {
  const { root, dryRun, format } = options;
  const plans = buildPlans(options);
  // Se calcula todo antes de escribir: si un producto choca, no se crea ninguno.
  const files = plans.flatMap((plan) =>
    planFiles(plan.type, plan.tokens).map((file) => ({ ...file, plan })),
  );

  const conflicts = files.filter((file) => existsSync(path.join(root, file.target)));
  if (conflicts.length > 0) {
    const names = [...new Set(conflicts.map((file) => file.plan.name))];
    const label = names.map((name) => `"${name}"`).join(" y ");
    const verb = names.length > 1 ? "ya existen" : "ya existe";
    throw new Error(
      `${label} ${verb}; no se sobrescribe nada. Archivos que chocan:\n  ${conflicts
        .map((file) => file.target)
        .join("\n  ")}`,
    );
  }

  console.log(
    `${dryRun ? "Se crearían" : "Creando"} ${files.length} archivos en ${plans.length} producto(s):`,
  );
  for (const plan of plans) {
    console.log(`\n  ${plan.name} (${TYPES[plan.type].label}) → apps/${plan.app}`);
    for (const file of files.filter((item) => item.plan === plan)) {
      console.log(`    + ${file.target}`);
    }
  }

  const touched = files.map((file) => file.target);
  if (!dryRun) {
    for (const file of files) {
      const destination = path.join(root, file.target);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, file.content);
    }
  }

  console.log(`\n${dryRun ? "Se registraría" : "Registrando"} en el resto del repo:`);
  for (const plan of plans) {
    for (const registration of planRegistrations(plan.type, plan.tokens)) {
      const result = dryRun ? { status: "pendiente" } : applyRegistration(root, registration);
      console.log(
        `  ${symbol(result.status)} ${registration.file}: ${registration.what} (${plan.name})`,
      );
      if (result.status === "cambiado") {
        touched.push(registration.file);
      } else if (result.status === "no encontrado") {
        console.log(`      No encontré dónde. Agrégalo a mano: ${registration.manual}`);
      }
    }
  }

  if (dryRun) {
    console.log("\n--dry-run: no se escribió nada.");
    return;
  }
  if (format) {
    formatFiles(root, [...new Set(touched)]);
  }
  printNextSteps(plans, options);
}

/** Lee la carpeta de plantillas del tipo y devuelve cada archivo con su ruta y contenido final. */
function planFiles(type, tokens) {
  const templateRoot = path.join(import.meta.dirname, "templates", type);
  return listFiles(templateRoot).map((relative) => {
    const target = render(relative, tokens, /__(name|app|environment)__/g).replace(/\.tpl$/, "");
    return {
      target: target.split(path.sep).join("/"),
      content: render(readFileSync(path.join(templateRoot, relative), "utf8"), tokens),
    };
  });
}

function listFiles(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    return entry.isDirectory() ? listFiles(path.join(directory, entry.name), relative) : [relative];
  });
}

/** Reemplaza [[clave]] (o la forma que indique `pattern`) y falla si la clave no existe. */
function render(text, tokens, pattern = /\[\[(\w+)\]\]/g) {
  return text.replace(pattern, (_, key) => {
    if (!(key in tokens)) {
      throw new Error(`La plantilla usa un valor desconocido: "${key}".`);
    }
    return tokens[key];
  });
}

/** Qué archivos existentes hay que tocar para que el producto nuevo corra en Docker y CI. */
function planRegistrations(type, tokens) {
  const { name, app: dir } = tokens;
  const description = `${TYPES[type].label} · ${name}`;

  if (type === "android") {
    return [
      {
        file: "eslint.config.mjs",
        what: "reglas de WebdriverIO para la app móvil",
        manual: `suma "apps/${dir}/**" y "libs/*/${name}/**" a la lista MOBILE`,
        edit: (text) =>
          editList(
            text,
            /^(const MOBILE = \[)([^\]]*)(\];)$/m,
            [`"apps/${dir}/**"`, `"libs/*/${name}/**"`],
            `"apps/${dir}/**"`,
          ),
      },
    ];
  }

  return [
    {
      file: "docker/run-tests.sh",
      what: "paquetes del reporte de Docker",
      manual: `suma apps/${dir} a PACKAGES`,
      edit: (text) =>
        editList(text, /^(PACKAGES=\()([^)\n]*)(\))$/m, [`apps/${dir}`], `apps/${dir}`, " "),
    },
    {
      file: "docker/summary.mjs",
      what: "nombre en el resumen del reporte",
      manual: `suma "${dir}": "${description}" a DESCRIPTIONS`,
      edit: (text) => {
        if (text.includes(`"${dir}":`)) {
          return { text, status: "ya estaba" };
        }
        const pattern = /(const DESCRIPTIONS = \{\n[\s\S]*?)(\n\};)/;
        if (!pattern.test(text)) {
          return { text, status: "no encontrado" };
        }
        return {
          text: text.replace(pattern, `$1\n  "${dir}": "${description}",$2`),
          status: "cambiado",
        };
      },
    },
    {
      file: ".circleci/config.yml",
      what: "las dos listas app: de los workflows",
      manual: `suma ${dir} a las dos listas "app: [...]" del workflow qa`,
      edit: (text) => {
        // Una línea (app: [a, b]) o el formato de varias líneas que deja Prettier.
        const patterns = [
          /^(\s*app: \[)([^\]\n]+)(\])$/gm,
          /^(\s*app:\n\s*\[\n)((?:[ ]+[\w-]+,\n)+)([ ]*\])$/gm,
        ];
        const found = patterns.flatMap((pattern) => [...text.matchAll(pattern)]);
        if (found.length === 0) {
          return { text, status: "no encontrado" };
        }
        if (found.every((match) => hasItem(match[2], dir))) {
          return { text, status: "ya estaba" };
        }
        let updated = text;
        for (const pattern of patterns) {
          updated = updated.replace(pattern, (line, open, body, close) =>
            hasItem(body, dir) ? line : `${open}${appendItems(body, [dir])}${close}`,
          );
        }
        return { text: updated, status: "cambiado" };
      },
    },
  ];
}

/** Agrega elementos al final de una lista de una línea o en el formato multilínea de Prettier. */
function editList(text, pattern, additions, marker, separator = ", ") {
  const match = text.match(pattern);
  if (!match) {
    return { text, status: "no encontrado" };
  }
  if (match[2].includes(marker)) {
    return { text, status: "ya estaba" };
  }
  return {
    text: text.replace(pattern, `$1${appendItems(match[2], additions, separator)}$3`),
    status: "cambiado",
  };
}

function applyRegistration(root, registration) {
  const file = path.join(root, registration.file);
  if (!existsSync(file)) {
    return { status: "no encontrado" };
  }
  const result = registration.edit(readFileSync(file, "utf8"));
  if (result.status === "cambiado") {
    writeFileSync(file, result.text);
  }
  return result;
}

function symbol(status) {
  return { cambiado: "~", "ya estaba": "=", "no encontrado": "!", pendiente: "~" }[status];
}

/** Deja lo generado con el mismo formato que el resto del repo. Si falla, solo avisa. */
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

function printNextSteps(plans, { environment }) {
  console.log("\nSiguientes pasos:");
  console.log(
    "  Una sola vez, para todos: corre `pnpm install`. Agrega los paquetes nuevos al workspace y " +
      "actualiza pnpm-lock.yaml. Haz commit del lockfile; sin él, el CI falla con --frozen-lockfile.",
  );
  for (const plan of plans) {
    console.log(`\n  ${plan.name} (${TYPES[plan.type].label}):`);
    stepsFor(plan).forEach((step, index) => console.log(`    ${index + 1}. ${step}`));
  }
  if (environment !== "public-demo") {
    console.log(
      `\n  Para todos: el CI y el cargador usan public-demo por defecto. Para que usen ` +
        `"${environment}", cambia \`test_env\` en .circleci/config.yml y DEFAULT_ENVIRONMENT en ` +
        "libs/test-data/loader.ts. Más detalle en docs/empezar.md.",
    );
  }
}

function stepsFor({ type, name, app, tokens, usesDefaultUrl, environment }) {
  const { ENV_PREFIX } = tokens;
  const steps = [];
  if (type === "web") {
    steps.push(
      `Ajusta los selectores de libs/pages/${name} y los textos de ` +
        `libs/test-data/${name}/common/messages.json.`,
    );
  }
  if (type === "api") {
    steps.push(
      `Ajusta la ruta de libs/api/${name}/status.client.ts y el contrato de schemas.ts a tu servicio.`,
    );
  }
  if (type === "android") {
    steps.push(
      `Copia tu APK de depuración en apps/${app}/app/${name}.apk y revisa el paquete en ` +
        `libs/components/${name}/android-id.ts. Ajusta las pantallas de libs/pages/${name}.`,
    );
  }
  if (usesDefaultUrl && type !== "android") {
    steps.push(`Cambia baseUrl en libs/test-data/${name}/environments/${environment}.json.`);
  }
  if (type !== "api") {
    steps.push(
      `Define ${ENV_PREFIX}_STANDARD_USER y ${ENV_PREFIX}_STANDARD_PASSWORD en tu terminal y en el ` +
        "context del CI. Las cuentas de prueba las crea una persona; nunca van en el repo.",
    );
  }
  steps.push(
    `Corre \`pnpm test:layers\` y luego \`TEST_ENV=${environment} pnpm ${
      type === "android"
        ? `--filter ${app} exec wdio run wdio.conf.ts`
        : `turbo run test:e2e --filter=${app}`
    }\`.`,
  );
  return steps;
}

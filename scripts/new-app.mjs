// Crea un producto nuevo con todas sus capas (datos, pages, steps, fixtures, app y pruebas de
// capas) y lo registra en Docker y CI. Las plantillas están en scripts/templates/<tipo>.
// Uso: pnpm new:app <nombre> --tipo web|api|android [opciones]. Con --ayuda se listan todas.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { parseArgs } from "node:util";

const TYPES = {
  web: { suffix: "e2e", label: "Web", registered: true },
  api: { suffix: "api", label: "API", registered: true },
  android: { suffix: "e2e", label: "App Android", registered: false },
};
const DEFAULT_URL = "https://staging.example.com";
const DEFAULT_ENVIRONMENT = "staging";

const HELP = `Uso: pnpm new:app <nombre> --tipo web|api|android [opciones]

Crea un producto nuevo con sus capas y lo registra en Docker y CI.

  <nombre>            minúsculas, números y guiones; empieza con letra (por ejemplo, mi-tienda)
  --tipo              web, api o android (obligatorio)
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
    const options = validate(positionals, values);
    run(options);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    console.error("Con --ayuda ves todas las opciones.");
    process.exitCode = 1;
  }
}

/** Comprueba los argumentos y arma los valores que se reemplazan en las plantillas. */
function validate(positionals, values) {
  const [name, ...extra] = positionals;
  if (!name || extra.length > 0) {
    throw new Error(
      "Indica un solo nombre de producto, por ejemplo: pnpm new:app mi-tienda --tipo web",
    );
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `Nombre inválido: "${name}". Usa minúsculas, números y guiones, y empieza con una letra.`,
    );
  }

  const type = values.tipo;
  if (!type || !(type in TYPES)) {
    throw new Error("Falta --tipo, o no es válido. Usa web, api o android.");
  }

  const environment = values.ambiente ?? DEFAULT_ENVIRONMENT;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(environment)) {
    throw new Error(`Ambiente inválido: "${environment}". Usa minúsculas, números y guiones.`);
  }

  const url = values.url ?? DEFAULT_URL;
  assertUrl(url);

  const applicationId = values.paquete ?? `com.example.${name.replaceAll("-", "")}`;
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(applicationId)) {
    throw new Error(`Paquete inválido: "${applicationId}". Ejemplo: com.empresa.app.`);
  }

  const root = path.resolve(values.raiz ?? path.join(import.meta.dirname, ".."));
  const camel = name.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());

  return {
    type,
    name,
    root,
    dryRun: values["dry-run"],
    format: !values["sin-formato"],
    usesDefaultUrl: values.url === undefined,
    tokens: {
      name,
      camel,
      ENV_PREFIX: name.toUpperCase().replaceAll("-", "_"),
      url,
      environment,
      package: applicationId,
    },
  };
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
  const { type, name, root, dryRun, tokens } = options;
  const files = planFiles(type, tokens);

  const existing = files.filter((file) => existsSync(path.join(root, file.target)));
  if (existing.length > 0) {
    throw new Error(
      `"${name}" ya existe; no se sobrescribe nada. Archivos que chocan:\n  ${existing
        .map((file) => file.target)
        .join("\n  ")}`,
    );
  }

  const registrations = planRegistrations(type, tokens);
  console.log(`${dryRun ? "Se crearían" : "Creando"} ${files.length} archivos de "${name}":`);
  for (const file of files) {
    console.log(`  + ${file.target}`);
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
  for (const registration of registrations) {
    const result = dryRun ? { status: "pendiente" } : applyRegistration(root, registration);
    console.log(`  ${symbol(result.status)} ${registration.file}: ${registration.what}`);
    if (result.status === "cambiado") {
      touched.push(registration.file);
    } else if (result.status === "no encontrado") {
      console.log(`      No encontré dónde. Agrégalo a mano: ${registration.manual}`);
    }
  }

  if (dryRun) {
    console.log("\n--dry-run: no se escribió nada.");
    return;
  }
  if (options.format) {
    formatFiles(root, touched);
  }
  printNextSteps(options);
}

/** Lee la carpeta de plantillas del tipo y devuelve cada archivo con su ruta y contenido final. */
function planFiles(type, tokens) {
  const templateRoot = path.join(import.meta.dirname, "templates", type);
  return listFiles(templateRoot).map((relative) => {
    const target = render(relative, tokens, /__(name|environment)__/g).replace(/\.tpl$/, "");
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
  const { name } = tokens;
  const dir = `${name}-${TYPES[type].suffix}`;
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

function appendItems(body, additions, separator = ", ") {
  if (!body.includes("\n")) {
    return body.trim() === ""
      ? additions.join(separator)
      : `${body}${separator}${additions.join(separator)}`;
  }
  const indent = body.match(/^\n?( +)/)?.[1] ?? "  ";
  const lines = additions.map((item) => `${indent}${item},\n`).join("");
  return `${body.replace(/\s*$/, "\n")}${lines}`;
}

function hasItem(body, item) {
  return body.split(/[,\n]/).some((entry) => entry.trim() === item);
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

function printNextSteps({ type, name, tokens, usesDefaultUrl }) {
  const { ENV_PREFIX, environment } = tokens;
  const dir = `${name}-${TYPES[type].suffix}`;
  const steps = [
    "Corre `pnpm install`: agrega el paquete nuevo al workspace y actualiza pnpm-lock.yaml. " +
      "Haz commit del lockfile; sin él, el CI falla con --frozen-lockfile.",
  ];
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
      `Copia tu APK de depuración en apps/${dir}/app/${name}.apk y revisa el paquete en ` +
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
        ? `--filter ${dir} exec wdio run wdio.conf.ts`
        : `turbo run test:e2e --filter=${dir}`
    }\`.`,
  );
  if (environment !== "public-demo") {
    steps.push(
      `El CI y el cargador usan public-demo por defecto. Para que usen "${environment}", cambia ` +
        "`test_env` en .circleci/config.yml y DEFAULT_ENVIRONMENT en libs/test-data/loader.ts. " +
        "Más detalle en docs/empezar.md.",
    );
  }

  console.log("\nSiguientes pasos:");
  steps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
}

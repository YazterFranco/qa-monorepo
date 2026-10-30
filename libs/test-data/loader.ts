import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { environmentSchema, type Environment } from "./schema";

export const DEFAULT_ENVIRONMENT = "public-demo";

const PRODUCTS_DIR = __dirname;
const NAME = /^[a-z0-9-]+$/;
const VARIABLE_REFERENCE = /\$\{([A-Z0-9_]+)\}/g;

export interface LoadOptions {
  /** Carpeta con una subcarpeta por producto. Por defecto, la de test-data. */
  root?: string;
  /** Origen de las variables ${VAR}. Por defecto, process.env. */
  variables?: NodeJS.ProcessEnv;
}

/**
 * Carga los datos de un producto en un ambiente: combina <product>/common/*.json con
 * <product>/environments/<name>.json (el ambiente gana), resuelve las referencias ${VAR}
 * y valida el resultado. Sin nombre, usa TEST_ENV o public-demo.
 */
export function loadEnvironment(
  product: string,
  name: string = process.env.TEST_ENV || DEFAULT_ENVIRONMENT,
  { root = PRODUCTS_DIR, variables = process.env }: LoadOptions = {},
): Environment {
  assertName("producto", product);
  assertName("ambiente", name);

  const productDir = path.join(root, product);
  if (!existsSync(path.join(productDir, "environments"))) {
    throw new Error(
      `No existe el producto "${product}". Disponibles: ${listProducts(root).join(", ")}.`,
    );
  }

  const environmentsDir = path.join(productDir, "environments");
  const file = path.join(environmentsDir, `${name}.json`);
  if (!existsSync(file)) {
    throw new Error(
      `No existe el ambiente "${name}" de "${product}". Disponibles: ${listJson(environmentsDir).join(", ")}.`,
    );
  }

  const data = deepMerge(loadCommon(path.join(productDir, "common")), readJson(file));
  const result = environmentSchema.safeParse(resolveVariables(data, variables));
  if (!result.success) {
    throw new Error(
      `El ambiente "${name}" de "${product}" no cumple el esquema:\n${result.error.message}`,
    );
  }
  return result.data;
}

/** Reemplaza cada ${VAR} por su valor. Falla si la variable no está definida, sin mostrar valores. */
export function resolveVariables(value: unknown, variables: NodeJS.ProcessEnv): unknown {
  if (typeof value === "string") {
    return value.replace(VARIABLE_REFERENCE, (_, variable: string) => {
      const resolved = variables[variable];
      if (!resolved) {
        throw new Error(`Falta la variable de entorno ${variable}.`);
      }
      return resolved;
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveVariables(item, variables));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveVariables(item, variables)]),
    );
  }
  return value;
}

function assertName(kind: string, name: string): void {
  if (!NAME.test(name)) {
    throw new Error(`Nombre de ${kind} inválido: "${name}". Usa minúsculas, números y guiones.`);
  }
}

/** Cada archivo de common/ aporta una clave con su nombre: users.json → users. */
function loadCommon(directory: string): Record<string, unknown> {
  if (!existsSync(directory)) {
    return {};
  }
  return Object.fromEntries(
    listJson(directory).map((domain) => [domain, readJson(path.join(directory, `${domain}.json`))]),
  );
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override;
  }
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return merged;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

function listJson(directory: string): string[] {
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => entry.replace(/\.json$/, ""));
}

function listProducts(root: string): string[] {
  return readdirSync(root).filter((entry) => existsSync(path.join(root, entry, "environments")));
}

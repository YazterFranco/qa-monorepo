import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { environmentSchema, type Environment } from "./schema";

export const DEFAULT_ENVIRONMENT = "public-demo";

const ENVIRONMENTS_DIR = path.join(__dirname, "environments");
const ENVIRONMENT_NAME = /^[a-z0-9-]+$/;
const VARIABLE_REFERENCE = /\$\{([A-Z0-9_]+)\}/g;

export interface LoadOptions {
  /** Carpeta con los JSON de ambiente. Por defecto, environments/. */
  directory?: string;
  /** Origen de las variables ${VAR}. Por defecto, process.env. */
  variables?: NodeJS.ProcessEnv;
}

/**
 * Carga environments/<name>.json, resuelve las referencias ${VAR} y valida el resultado.
 * Sin nombre, usa TEST_ENV o public-demo.
 */
export function loadEnvironment(
  name: string = process.env.TEST_ENV || DEFAULT_ENVIRONMENT,
  { directory = ENVIRONMENTS_DIR, variables = process.env }: LoadOptions = {},
): Environment {
  if (!ENVIRONMENT_NAME.test(name)) {
    throw new Error(`Nombre de ambiente inválido: "${name}". Usa minúsculas, números y guiones.`);
  }

  const file = path.join(directory, `${name}.json`);
  if (!existsSync(file)) {
    const available = readdirSync(directory)
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => entry.replace(/\.json$/, ""));
    throw new Error(`No existe el ambiente "${name}". Disponibles: ${available.join(", ")}.`);
  }

  const raw: unknown = JSON.parse(readFileSync(file, "utf8"));
  const result = environmentSchema.safeParse(resolveVariables(raw, variables));
  if (!result.success) {
    throw new Error(`El ambiente "${name}" no cumple el esquema:\n${result.error.message}`);
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
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveVariables(item, variables)]),
    );
  }
  return value;
}

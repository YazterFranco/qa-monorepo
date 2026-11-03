/**
 * Dónde corre la app Android: en el emulador de tu máquina ("local", por defecto) o en un
 * dispositivo de BrowserStack ("browserstack"). Se elige con la variable MOBILE_TARGET.
 *
 * Este archivo solo arma datos (conexión, capabilities, script de estado); no abre sesiones.
 * Las credenciales llegan por variables de entorno y nunca se escriben en el repo.
 */
export type MobileTarget = "local" | "browserstack";

type Variables = NodeJS.ProcessEnv;

/**
 * Actividades que Appium espera al abrir la app. Si tu app abre una pantalla de otro paquete
 * (por ejemplo, un splash), cámbialo.
 */
export const APP_WAIT_ACTIVITY = "[[package]].*";

const BROWSERSTACK_HUB = {
  hostname: "hub.browserstack.com",
  port: 443,
  protocol: "https",
  path: "/wd/hub",
} as const;

// Un teléfono real y reciente de BrowserStack. BROWSERSTACK_DEVICE y BROWSERSTACK_OS_VERSION
// eligen otro.
const DEFAULT_DEVICE = "Google Pixel 8";
const DEFAULT_OS_VERSION = "14.0";

export function resolveTarget(variables: Variables = process.env): MobileTarget {
  const target = variables.MOBILE_TARGET || "local";
  if (target !== "local" && target !== "browserstack") {
    throw new Error(`MOBILE_TARGET inválido: "${target}". Usa local o browserstack.`);
  }
  return target;
}

/** Usuario, clave y servidor de BrowserStack. Falla con el nombre de la variable que falta. */
export function browserStackConnection(variables: Variables = process.env) {
  return {
    user: required(variables, "BROWSERSTACK_USERNAME"),
    key: required(variables, "BROWSERSTACK_ACCESS_KEY"),
    ...BROWSERSTACK_HUB,
  };
}

/**
 * Capabilities de Appium para un dispositivo de BrowserStack. BROWSERSTACK_APP es el `bs://...`
 * que imprime `pnpm --filter [[app]] app:upload`.
 */
export function browserStackCapabilities(variables: Variables = process.env) {
  return {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": variables.BROWSERSTACK_DEVICE || DEFAULT_DEVICE,
    "appium:platformVersion": variables.BROWSERSTACK_OS_VERSION || DEFAULT_OS_VERSION,
    "appium:app": required(variables, "BROWSERSTACK_APP"),
    "appium:appWaitActivity": APP_WAIT_ACTIVITY,
    "appium:newCommandTimeout": 240,
    "bstack:options": {
      projectName: "[[name]]",
      buildName: buildName(variables),
      sessionName: "[[app]]",
    },
  };
}

/** Marca la sesión como pasada o fallida en el panel de BrowserStack (ejecutor oficial). */
export function sessionStatusScript(passed: boolean): string {
  const status = passed ? "passed" : "failed";
  const reason = passed ? "Todas las pruebas pasaron" : "Hubo pruebas fallidas";
  const payload = { action: "setSessionStatus", arguments: { status, reason } };
  return `browserstack_executor: ${JSON.stringify(payload)}`;
}

/** Agrupa las sesiones de un mismo pipeline de CircleCI en un solo "build" del panel. */
function buildName(variables: Variables): string {
  if (variables.BROWSERSTACK_BUILD) {
    return variables.BROWSERSTACK_BUILD;
  }
  return variables.CIRCLE_BUILD_NUM ? `circleci-${variables.CIRCLE_BUILD_NUM}` : "local";
}

function required(variables: Variables, name: string): string {
  const value = variables[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
}

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  APP_WAIT_ACTIVITY,
  browserStackCapabilities,
  browserStackConnection,
  resolveTarget,
  sessionStatusScript,
} from "./targets";

// MOBILE_TARGET=local (por defecto): emulador de tu máquina. MOBILE_TARGET=browserstack: un
// dispositivo en la nube de BrowserStack, con el mismo Appium y los mismos specs.
const cloud = resolveTarget() === "browserstack";

if (!cloud) {
  // Rutas por defecto de macOS; en otra máquina se definen en el entorno.
  process.env.ANDROID_HOME ??= path.join(os.homedir(), "Library/Android/sdk");
  if (!process.env.JAVA_HOME && process.platform === "darwin") {
    process.env.JAVA_HOME = execFileSync("/usr/libexec/java_home", { encoding: "utf8" }).trim();
  }
  // Appium busca sus drivers en APPIUM_HOME; aquí están como dependencias de esta app.
  process.env.APPIUM_HOME ??= __dirname;
}

const resultsDir = path.join(__dirname, "test-results");

/** Lo que no cambia entre el emulador local y BrowserStack. */
const common: WebdriverIO.Config = {
  runner: "local",
  specs: ["./**/*.spec.ts"],
  exclude: ["./node_modules/**"],
  // Igual que Playwright: sin reintentos local y uno en CI. En emuladores el servidor de
  // UiAutomator2 se cae a veces a mitad de sesión; el reintento repite el archivo completo.
  specFileRetries: process.env.CI ? 1 : 0,
  framework: "mocha",
  mochaOpts: { ui: "bdd", timeout: 180_000 },
  reporters: ["spec"],
  waitforTimeout: 15_000,
  logLevel: "warn",
  // Como el screenshot y el trace de Playwright: qué había en pantalla cuando falló.
  afterTest: async (test, _context, { passed }) => {
    if (!passed) await saveEvidence(`${test.parent} ${test.title}`);
  },
  afterHook: async (test, _context, { passed }) => {
    if (!passed) await saveEvidence(`${test.parent} ${test.title} hook`);
  },
};

/** El emulador que usa Appium en tu máquina; si no está encendido, lo arranca. */
function localTarget(): WebdriverIO.Config {
  return {
    maxInstances: 1,
    capabilities: [
      {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:avd": process.env.ANDROID_AVD ?? "Pixel_10_Pro",
        "appium:avdLaunchTimeout": 300_000,
        "appium:app": path.join(__dirname, "app", "[[name]].apk"),
        "appium:appWaitActivity": APP_WAIT_ACTIVITY,
        "appium:newCommandTimeout": 240,
      },
    ],
    services: ["appium"],
  };
}

/** Un dispositivo de BrowserStack: sin servicio de Appium, porque el servidor está en la nube. */
function browserStackTarget(): WebdriverIO.Config {
  return {
    ...browserStackConnection(),
    // Sesiones en paralelo: no pases del límite de tu plan de BrowserStack.
    maxInstances: Number(process.env.BROWSERSTACK_PARALLEL) || 1,
    capabilities: [browserStackCapabilities() as WebdriverIO.Capabilities],
    // Cada archivo es una sesión; sin esto el panel las deja como "sin estado".
    after: async (result) => {
      try {
        await browser.execute(sessionStatusScript(result === 0));
      } catch (error) {
        // La sesión ya pudo cerrarse; el resultado de la prueba no cambia.
        console.warn("No se pudo marcar el estado de la sesión en BrowserStack:", error);
      }
    },
  };
}

export const config: WebdriverIO.Config = {
  ...common,
  ...(cloud ? browserStackTarget() : localTarget()),
};

async function saveEvidence(title: string): Promise<void> {
  const name = title.replace(/[^\w-]+/g, "-");
  mkdirSync(resultsDir, { recursive: true });
  try {
    await browser.saveScreenshot(path.join(resultsDir, `${name}.png`));
    writeFileSync(path.join(resultsDir, `${name}.xml`), await browser.getPageSource());
  } catch (error) {
    // Si el driver ya no responde, no hay evidencia que guardar; el error original sigue.
    console.warn(`No se pudo guardar la evidencia de "${title}":`, error);
  }
}

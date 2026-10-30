import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Rutas por defecto de macOS; en CI o en otra máquina se definen en el entorno.
process.env.ANDROID_HOME ??= path.join(os.homedir(), "Library/Android/sdk");
if (!process.env.JAVA_HOME && process.platform === "darwin") {
  process.env.JAVA_HOME = execFileSync("/usr/libexec/java_home", { encoding: "utf8" }).trim();
}
// Appium busca sus drivers en APPIUM_HOME; aquí están como dependencias de esta app.
process.env.APPIUM_HOME ??= __dirname;

const resultsDir = path.join(__dirname, "test-results");

export const config: WebdriverIO.Config = {
  runner: "local",
  specs: ["./**/*.spec.ts"],
  exclude: ["./node_modules/**"],
  maxInstances: 1,
  // Igual que Playwright: sin reintentos local y uno en CI. En emuladores el servidor de
  // UiAutomator2 se cae a veces a mitad de sesión; el reintento repite el archivo completo.
  specFileRetries: process.env.CI ? 1 : 0,
  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      // El emulador que usa Appium; si no está encendido, lo arranca.
      "appium:avd": process.env.ANDROID_AVD ?? "Pixel_10_Pro",
      "appium:avdLaunchTimeout": 300_000,
      "appium:app": path.join(__dirname, "app", "my-demo-app.apk"),
      "appium:appWaitActivity": "com.saucelabs.mydemoapp.android.view.activities.*",
      "appium:newCommandTimeout": 240,
    },
  ],
  services: ["appium"],
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

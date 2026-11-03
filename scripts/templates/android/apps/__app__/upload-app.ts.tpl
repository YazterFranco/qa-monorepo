// Sube el APK a BrowserStack con su API oficial y imprime el `bs://...` que identifica la app.
// Uso: pnpm --filter [[app]] --silent app:upload [ruta-al-apk]
// Credenciales: BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY, del entorno. No se imprimen.
// Lo único que va a stdout es el `bs://...`, para poder guardarlo en BROWSERSTACK_APP.
import { readFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_URL = "https://api-cloud.browserstack.com/app-automate/upload";
// Con un id propio, subir otra versión reemplaza la anterior en tu panel de BrowserStack.
const CUSTOM_ID = "[[name]]";

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const username = required("BROWSERSTACK_USERNAME");
  const accessKey = required("BROWSERSTACK_ACCESS_KEY");
  const apk = path.resolve(process.argv[2] ?? path.join("app", "[[name]].apk"));

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(await readFile(apk))]), path.basename(apk));
  form.append("custom_id", CUSTOM_ID);

  console.error(`Subiendo ${path.basename(apk)} a BrowserStack...`);
  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${accessKey}`).toString("base64")}`,
    },
    body: form,
  });
  if (!response.ok) {
    throw new Error(
      `BrowserStack respondió ${response.status} ${response.statusText} al subir el APK.`,
    );
  }

  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("app_url" in body)) {
    throw new Error("La respuesta de BrowserStack no trae app_url.");
  }
  if (typeof body.app_url !== "string" || !body.app_url.startsWith("bs://")) {
    throw new Error("El app_url de BrowserStack no tiene el formato bs://...");
  }
  console.log(body.app_url);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
}

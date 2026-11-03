# [[app]]

Pruebas móviles nativas de `[[name]]` (Android) con Appium, UiAutomator2 y WebdriverIO. Generada con `pnpm new:app [[name]] --tipo android`. Corren en un emulador de tu máquina o en BrowserStack; `MOBILE_TARGET` elige dónde (`local` por defecto, o `browserstack`).

## Antes de la primera corrida

1. **El APK.** No se guarda en el repo. Copia un APK de depuración de tu app en `apps/[[app]]/app/[[name]].apk`.
2. **El paquete.** Está en [android-id.ts](../../libs/components/[[name]]/android-id.ts) (`[[package]]`). Si no es el de tu app, cámbialo. Sirve para reiniciar la app y para los selectores por resource-id.
3. **Credenciales.** Las cuentas de prueba las crea una persona. Define estas variables en tu terminal; nunca van en el repo:

   | Variable                        | Para qué                          |
   | ------------------------------- | --------------------------------- |
   | `[[ENV_PREFIX]]_STANDARD_USER`     | Usuario de prueba que sí entra    |
   | `[[ENV_PREFIX]]_STANDARD_PASSWORD` | Contraseña de ese usuario         |

4. **Selectores.** Ajusta [login.screen.ts](../../libs/pages/[[name]]/login.screen.ts) y [home.screen.ts](../../libs/pages/[[name]]/home.screen.ts). Para ver los elementos de tu app, usa Appium Inspector. Prefiere accessibility id (`~texto`) o resource-id.
5. **Textos esperados.** Rellena [messages.json](../../libs/test-data/[[name]]/common/messages.json).

## Correr en el emulador

Necesitas Android SDK con un emulador, Java 17 o más, y `ANDROID_HOME` y `JAVA_HOME`. El emulador se elige con `ANDROID_AVD`.

```bash
export TEST_ENV=[[environment]]
pnpm --filter [[app]] exec wdio run wdio.conf.ts
```

## Correr en BrowserStack

Sin emulador, Android SDK ni Java: la sesión corre en un dispositivo real de BrowserStack.

```bash
export BROWSERSTACK_USERNAME=<usuario>
export BROWSERSTACK_ACCESS_KEY=<clave>
export BROWSERSTACK_APP=$(pnpm --filter [[app]] --silent app:upload)
MOBILE_TARGET=browserstack pnpm --filter [[app]] exec wdio run wdio.conf.ts
```

Variables opcionales:

| Variable                  | Para qué                                          | Por defecto      |
| ------------------------- | ------------------------------------------------- | ---------------- |
| `BROWSERSTACK_DEVICE`     | Dispositivo, como aparece en BrowserStack         | `Google Pixel 8` |
| `BROWSERSTACK_OS_VERSION` | Versión de Android                                | `14.0`           |
| `BROWSERSTACK_PARALLEL`   | Sesiones a la vez; no pases del límite de tu plan | `1`              |
| `BROWSERSTACK_BUILD`      | Nombre del grupo de sesiones en el panel          | `circleci-<n>`   |

BrowserStack guarda cada app subida 30 días: si no cambió el APK, reutiliza el mismo `BROWSERSTACK_APP`. El workflow `mobile` de CircleCI solo se lanza con `run_mobile=true` y su job `e2e-mobile-browserstack` filtra por una app: cambia el `--filter` por `[[app]]` para correr esta.

Mientras los textos de `messages.json` digan `TODO`, los tests fallan a propósito: así no pasan por error.

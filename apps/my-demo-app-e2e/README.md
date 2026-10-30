# my-demo-app-e2e

Pruebas móviles nativas de [My Demo App](https://github.com/saucelabs/my-demo-app-android), la app Android de demostración de Sauce Labs. Corren con Appium (driver UiAutomator2) y WebdriverIO con Mocha, en un emulador.

## Escenarios

| Spec                           | Escenario           | Resultado esperado                   |
| ------------------------------ | ------------------- | ------------------------------------ |
| [login.spec.ts](login.spec.ts) | Login correcto      | Vuelve al catálogo                   |
|                                | Usuario bloqueado   | Error de bloqueo                     |
|                                | Sin usuario         | Pide el usuario                      |
| [cart.spec.ts](cart.spec.ts)   | Agregar un producto | El contador y el carrito lo muestran |
|                                | Quitar el producto  | El contador desaparece               |

Antes de cada test se borran los datos de la app y se abre de nuevo, así ninguno depende de otro.

## Requisitos

- Android SDK con un emulador. Por defecto se usa `Pixel_10_Pro`; otro se elige con `ANDROID_AVD`.
- Java 17 o más.
- `ANDROID_HOME` y `JAVA_HOME`. En macOS, [wdio.conf.ts](wdio.conf.ts) usa las rutas por defecto si no están definidas.
- El APK, que no se guarda en el repo:

  ```bash
  pnpm --filter my-demo-app-e2e app:download
  ```

Appium y su driver son dependencias de esta app; no hace falta instalarlos aparte.

## Correr

```bash
pnpm test:mobile
pnpm --filter my-demo-app-e2e exec wdio run wdio.conf.ts --spec login.spec.ts
```

Si el emulador no está encendido, Appium lo arranca. La primera corrida tarda más porque instala su servidor en el dispositivo; después, cada archivo tarda 1 o 2 minutos.

Si un test o un `beforeEach` falla, quedan una captura y el árbol de la pantalla en `test-results/`.

**Estabilidad:** en el emulador `Pixel_10_Pro` (Android 17) el servidor de UiAutomator2 a veces se cae a mitad de la sesión ("instrumentation process is not running"), y todos los tests que siguen en ese archivo fallan. No es un error de las pruebas: en las verificaciones pasó en 3 de 6 corridas. En CI el archivo se reintenta una vez. Si pasa seguido en local, reinicia el emulador en frío.

## Cómo encaja con el resto

- **Datos:** salen de [libs/test-data/my-demo-app](../../libs/test-data/my-demo-app), igual que en web y API.
- **Capas:** las pantallas están en `pages/my-demo-app` (`*.screen.ts`), las partes comunes en `components/my-demo-app` y las acciones en `steps/my-demo-app`.
- **Fixtures:** WebdriverIO no tiene fixtures como Playwright. [fixtures/my-demo-app](../../libs/fixtures/my-demo-app) exporta `myDemoApp(driver)`, que devuelve `env`, los steps y `restartApp`.
- **Selectores:** accessibility id (`~View menu`) o resource-id (`nameET`), el equivalente Android de un `data-testid`.

## Aviso de compatibilidad de 16 KB

En emuladores con páginas de 16 KB (como `Pixel_10_Pro`), Android muestra "This app isn't 16 KB compatible" al abrir una pantalla nueva, varios segundos después. [compatibility-dialog.component.ts](../../libs/components/my-demo-app/compatibility-dialog.component.ts) lo cierra mientras espera la pantalla siguiente; los steps lo usan en cada navegación que abre una pantalla nueva.

Las reglas de los specs están en [apps/the-internet-e2e/README.md](../the-internet-e2e/README.md#reglas-de-los-specs); en móvil, `test` y `expect` vienen de Mocha y `@wdio/globals`.

---
paths:
  - "apps/my-demo-app-e2e/**"
  - "libs/*/my-demo-app/**"
  - "apps/saucedemo-e2e/playwright.config.ts"
  - "libs/utils/playwright.base.ts"
---

# Pruebas móviles

Hay dos tipos y no se mezclan.

## Emulación móvil web

- Son proyectos de Playwright: `pixel-7` e `iphone-15`, en `libs/utils/playwright.base.ts`.
- Usan los mismos specs, pages y datos que el escritorio. Si un test necesita otra cosa en móvil, primero averigua por qué.
- Un perfil nuevo se agrega en `utils` y en `projects` de la app. Los perfiles con WebKit van con `workers: 2`.
- Prueba la web en tamaño de teléfono, no un teléfono real ni una app nativa. Dilo así en los reportes.

## App nativa de Android

- Vive en `apps/my-demo-app-e2e`, con Appium, UiAutomator2 y WebdriverIO. Las pantallas son `<pantalla>.screen.ts`.
- Los elementos son getters, porque WebdriverIO los busca de nuevo cada vez. Usa accessibility id (`~...`) o resource-id.
- WebdriverIO no tiene fixtures: el spec arma todo con `myDemoApp(driver)` y llama a `restartApp()` en `beforeEach`.
- Toda navegación que abre una pantalla espera esa pantalla y cierra el aviso de 16 KB si aparece.
- Corre en dos lugares, que elige `MOBILE_TARGET`: `local` (emulador, por defecto) o `browserstack`. Los specs, pages y steps son los mismos; lo que cambia está solo en `targets.ts` y `wdio.conf.ts`.
- El emulador no corre en Docker ni en CI: necesita aceleración por hardware. En CI la app corre en BrowserStack, con el workflow `mobile`, que solo se lanza con `run_mobile=true`.
- Las credenciales de BrowserStack (`BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY`) vienen del entorno o del context `qa-browserstack` de CircleCI. Nunca las escribas en el repo, en un log ni en un comando visible. `BROWSERSTACK_APP` (el `bs://...`) no es un secreto.
- No lances sesiones de BrowserStack de más para confirmar lo que ya pasó: cuestan minutos del plan. Una variable de BrowserStack nueva va en `env` o `passThroughEnv` de `test:mobile` en `turbo.json`.
- El servidor de UiAutomator2 a veces se cae en el emulador (`instrumentation process is not running`). Reinicia el emulador antes de culpar al test.
- El APK no se guarda en el repo. Se baja con `pnpm --filter my-demo-app-e2e app:download` y, para BrowserStack, se sube con `app:upload`.

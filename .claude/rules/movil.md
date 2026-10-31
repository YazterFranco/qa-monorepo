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
- No corre en Docker ni en CI: el emulador necesita aceleración por hardware.
- El servidor de UiAutomator2 a veces se cae en el emulador (`instrumentation process is not running`). Reinicia el emulador antes de culpar al test.
- El APK no se guarda en el repo. Se baja con `pnpm --filter my-demo-app-e2e app:download`.

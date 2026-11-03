# Empezar con tu propio proyecto

El repo trae cuatro productos de demostración públicos. Esta guía explica cómo llevarlo a tu página web, tu app móvil o tus servicios, y cómo usarlo con Bitbucket.

Lo que hace el comando `pnpm new:app` está probado en una copia temporal del repo (genera los archivos, los registra y comprueba que los datos cumplen el esquema). Lo que no se ha podido probar de punta a punta, porque requiere tus cuentas y tu app, está marcado en cada sección.

## 1. Conseguir el repo

No hace falta `git clone`. Elige una:

| Opción                 | Cómo                                                                      | Notas                                                                  |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Importar a Bitbucket   | Create → Repository → importar → pega la URL de GitHub del repo           | Deja el repo ya en Bitbucket. Puede pedir un token de GitHub           |
| Descargar el ZIP       | `https://github.com/YazterFranco/qa-monorepo/archive/refs/heads/main.zip` | Sin historial de git. Después haces `git init` y subes tu repo         |
| `degit` (copia limpia) | `npx degit YazterFranco/qa-monorepo mi-qa`                                | Igual que el ZIP, desde la terminal                                    |
| Plantilla de GitHub    | Botón "Use this template"                                                 | Solo aparece si la persona dueña del repo activa _Template repository_ |

Con el ZIP o `degit` empiezas sin historial. Para subirlo a tu repo vacío de Bitbucket:

```bash
cd mi-qa
git init -b main
git add .
git commit -m "Agrega el monorepo de pruebas"
git remote add origin <url-de-tu-repo-en-bitbucket>
git push -u origin main
```

## 2. Instalarlo

Sigue los pasos de [Requisitos e instalación](../README.md#requisitos) del README: Node 24, pnpm con corepack, `pnpm install` y, si vas a correr web, los navegadores de Playwright. Después verifica con `pnpm check:versions` y `pnpm test:layers`.

## 3. Crear tu producto

```bash
pnpm new:app <nombre> --tipo web|api|android [--url ...] [--ambiente ...] [--paquete ...]
```

El comando crea el producto con todas sus capas (datos, pages o clientes, steps, fixtures y la app), una prueba de capas para cada pieza, y lo registra en el reporte de Docker, en los dos workflows de CI y en las reglas de ESLint. Con `--dry-run` muestra lo que haría sin escribir nada. No sobrescribe nada: si el producto ya existe, se detiene.

Siempre sigue igual:

1. Corre `pnpm install`. Agrega el paquete nuevo al workspace y actualiza `pnpm-lock.yaml`. **Haz commit del lockfile**; sin él, el CI falla con `--frozen-lockfile`.
2. Ajusta lo que el comando no puede saber: URL, selectores, textos esperados.
3. Define las variables de las credenciales (sección 4).
4. Corre `pnpm test:layers` y luego la app.

Los tests generados fallan a propósito mientras los textos de `messages.json` digan `TODO`. Así no pasan por error con datos que nadie revisó.

### Página web con inicio de sesión

```bash
pnpm new:app mi-tienda --tipo web --url https://staging.mi-tienda.com
```

Crea `apps/mi-tienda-e2e` con un spec de login (entra bien y credenciales incorrectas), un `LoginPage` y un `HomePage`, un `AuthSteps` y su fixture. Lo que tienes que hacer tú:

- Ajustar los selectores de `libs/pages/mi-tienda` a tu pantalla (rol, etiqueta o `data-testid`).
- Escribir en `messages.json` el título que ve la persona al entrar y el mensaje de error exacto.
- Crear la cuenta de pruebas. Crear cuentas lo hace una persona, no el agente ni el repo.

Complejidad: **media** para el primer escenario; los siguientes son un spec y poco más. Hoy cada test inicia sesión desde cero, lo que sirve para pocas pruebas. Con muchas, conviene guardar la sesión con un proyecto de Playwright (`storageState`); no viene hecho.

Si tu login tiene **MFA, captcha o SSO**, no se automatizan. Pide un usuario de pruebas que no los tenga, o entra por API o por token.

### Servicios (API)

```bash
pnpm new:app mi-servicio --tipo api --url https://api.staging.mi-servicio.com
```

Crea `apps/mi-servicio-api` con un cliente de estado (`GET /health`), su esquema Zod y un spec. Cambia la ruta y la forma de la respuesta a las de tu servicio. Para endpoints con autenticación, sigue el ejemplo de `libs/api/restful-booker` (un `AuthClient` y un `AuthSteps`).

Complejidad: **baja**. No hay navegador ni selectores.

### App móvil (Android)

```bash
pnpm new:app mi-app --tipo android --paquete com.empresa.miapp
```

Crea `apps/mi-app-e2e` con la configuración de WebdriverIO y Appium que ya sabe correr en tu emulador o en BrowserStack (`MOBILE_TARGET=browserstack`), el script `app:upload` y un spec de login. Lo que tienes que hacer tú:

- Copiar un APK de depuración de tu app en `apps/mi-app-e2e/app/mi-app.apk`. No se guarda en el repo.
- Revisar el paquete (`applicationId`) en `libs/components/mi-app/android-id.ts`.
- Ajustar las pantallas a tu app. Appium Inspector muestra los selectores.
- Para BrowserStack: tus credenciales en variables de entorno, como se explica en el README de la app generada.

Complejidad: **media-alta**. Es la parte con más piezas externas: emulador o cuenta de BrowserStack, APK y selectores nativos. Dos límites a tener presentes:

- **iOS no está soportado.** Haría falta otro driver (XCUITest), un `.ipa` y otras capacidades.
- El workflow `mobile` de CircleCI solo corre `my-demo-app-e2e`. Para correr tu app, cambia el `--filter` del job `e2e-mobile-browserstack` (y el nombre de la variable `BROWSERSTACK_APP` si corres varias).

La parte de BrowserStack no se ha probado con una cuenta real.

## 4. Ambientes y credenciales de tu app

Los datos de cada ambiente están en `libs/test-data/<producto>/environments/<ambiente>.json`. El comando crea `staging.json` (cámbialo con `--ambiente`). Las credenciales nunca se escriben ahí: son referencias `${VAR}`.

```json
"standard": {
  "username": "${MI_TIENDA_STANDARD_USER}",
  "password": "${MI_TIENDA_STANDARD_PASSWORD}"
}
```

Para correr en tu máquina:

```bash
export MI_TIENDA_STANDARD_USER=<usuario>
export MI_TIENDA_STANDARD_PASSWORD=<contraseña>
TEST_ENV=staging pnpm turbo run test:e2e --filter=mi-tienda-e2e
```

Si falta una variable, el error dice cuál. En el CI van en un _context_ de CircleCI, nunca en el config.

**El ambiente por defecto.** Los ejemplos usan `public-demo`, que es lo que el cargador y el CI usan si no dices otra cosa. Para que tu ambiente sea el de siempre, cambia `DEFAULT_ENVIRONMENT` en [libs/test-data/loader.ts](../libs/test-data/loader.ts) y el parámetro `test_env` de [.circleci/config.yml](../.circleci/config.yml). Hazlo cuando hayas quitado los ejemplos: mientras convivan, los ejemplos solo existen en `public-demo`.

## 5. Quitar los ejemplos

Hazlo después de crear tu primer producto web o de API, para que las listas del CI no queden vacías. El comando se niega si todavía no tienes uno.

```bash
pnpm remove:examples              # solo muestra lo que haría
pnpm remove:examples --confirmar  # lo aplica
```

Borra las cuatro apps de ejemplo y sus carpetas en cada capa y en `tests-of-layers`, y las saca de `docker/run-tests.sh`, `docker/summary.mjs`, las listas `app:` de CircleCI y la lista `MOBILE` de ESLint. También quita de `tests-of-layers/test-data/loader.test.ts` el bloque que carga los datos de los ejemplos. Todo se calcula antes de tocar el disco, así que si algo falla no borra nada.

Después:

1. Corre `pnpm install` y haz commit de `pnpm-lock.yaml`.
2. Corre `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y `pnpm test:layers`.
3. Si usabas el workflow `mobile`, cambia el `--filter` de `e2e-mobile-browserstack` por tu app Android, o bórralo.
4. El comando lista los archivos que todavía nombran los ejemplos. Casi siempre son READMEs que los usan como ilustración y `docs/curso.html` y `docs/flujo.html`, que enseñan con ellos: cámbialos por tu producto o bórralos. `docs/reporte-ejemplo` es una foto del primer pipeline; puedes borrarla.
5. Cuando ya no los necesites, puedes borrar `scripts/remove-examples.mjs`, su prueba en `tests-of-layers/scripts` y el script `remove:examples` del `package.json`.

## 6. Bitbucket

| Pieza               | Qué pasa en Bitbucket                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Código              | Funciona igual: es git. Importa o sube el repo como en la sección 1                                                                                                                                                                               |
| CI                  | El pipeline es de CircleCI, que se conecta a Bitbucket desde _User Settings → Bitbucket_ y agrega una llave de solo lectura y un webhook al repo. Detalles en la [documentación de CircleCI](https://circleci.com/docs/2.0/bitbucket-integration) |
| Bitbucket Pipelines | No hay `bitbucket-pipelines.yml`. Si prefieres no usar CircleCI, hay que traducir los pasos (lint, typecheck, `test:layers`, `test:e2e`); no está hecho                                                                                           |
| `CODEOWNERS`        | El de `.github/` es de GitHub y está comentado. Bitbucket Cloud soporta un `CODEOWNERS` en `.bitbucket/`, con otra sintaxis (equipos y personas por correo, o grupos del workspace)                                                               |
| Plantilla de PR     | `.github/pull_request_template.md` es de GitHub. En Bitbucket no se aplica sola; revisa en los ajustes del repo cómo fijar una descripción por defecto                                                                                            |
| Hooks de pre-commit | Son locales (Husky): funcionan igual                                                                                                                                                                                                              |

La integración de CircleCI con Bitbucket está tomada de su documentación; no la he probado con tu cuenta, y los pasos del panel pueden variar según tu organización.

## Resumen: qué tan complicado es

| Tarea                               | Esfuerzo   | Lo que más pesa                                  |
| ----------------------------------- | ---------- | ------------------------------------------------ |
| Instalar y correr los ejemplos      | Bajo       | Node 24 y pnpm                                   |
| Agregar un servicio (API)           | Bajo       | La ruta y el contrato de tu servicio             |
| Agregar una web con login           | Medio      | Selectores, cuentas de prueba, MFA o captcha     |
| Agregar una app Android             | Medio-alto | APK, selectores nativos, emulador o BrowserStack |
| App iOS                             | Alto       | No está soportado                                |
| Pasar el CI de CircleCI a Bitbucket | Bajo-medio | Conectar el repo y crear el context con secretos |

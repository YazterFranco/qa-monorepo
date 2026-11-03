---
paths:
  - ".circleci/**"
  - "Dockerfile"
  - "compose.yaml"
  - ".dockerignore"
  - "docker/**"
  - "turbo.json"
---

# CI y Docker

- Prueba en local antes de subir: `docker compose run --rm qa` usa la misma imagen y el mismo script que el job `docker-e2e`.
- Reconstruye la imagen después de cambiar código o dependencias: `docker compose build`.
- La versión de Playwright debe coincidir en `pnpm-workspace.yaml`, `Dockerfile` y `.circleci/config.yml`; la de pnpm, en `package.json` y `Dockerfile`; la mayor de Node, en `.nvmrc`, `engines` y CircleCI. `pnpm check:versions` lo comprueba y el job `lint` lo corre.
- El workflow `qa` corre en cada push; `docker-e2e` solo en `main`. El workflow `mobile` (BrowserStack) solo corre con el parámetro `run_mobile=true` y usa el context `qa-browserstack`.
- Turbo corre en modo estricto: una tarea solo ve las variables declaradas. Si algo funciona en local y no en la imagen, revisa `turbo.json` primero.
- Una app nueva se crea con `pnpm new:app`, que la registra en las dos listas `app:` del workflow, en `PACKAGES` de `docker/run-tests.sh` y en `DESCRIPTIONS` de `docker/summary.mjs`. Si la agregas a mano, toca esos tres sitios. Después corre `pnpm install` y haz commit de `pnpm-lock.yaml`.
- Nada personal ni secreto entra en la imagen: revisa `.dockerignore` si agregas archivos locales.
- Las credenciales van en el context del CI, nunca en el config. En `docker-e2e` también se pasan con `--env`.
- Los minutos de CI cuestan: no relances un pipeline para confirmar lo que ya pasó. Revisa el estado con `gh` o con la API oficial, no con scripts sobre una sesión del navegador.
- `pnpm` bloquea los scripts de instalación. Si una dependencia nueva lo pide, lee qué hace antes de aprobarla en `allowBuilds`.

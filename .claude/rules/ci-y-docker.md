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
- La versión de Playwright debe coincidir en `pnpm-workspace.yaml`, `Dockerfile` y `.circleci/config.yml`.
- Turbo corre en modo estricto: una tarea solo ve las variables declaradas. Si algo funciona en local y no en la imagen, revisa `turbo.json` primero.
- Una app nueva va en las dos listas `app:` del workflow y en `PACKAGES` de `docker/run-tests.sh`.
- Nada personal ni secreto entra en la imagen: revisa `.dockerignore` si agregas archivos locales.
- Las credenciales van en el context del CI, nunca en el config. En `docker-e2e` también se pasan con `--env`.
- Los minutos de CI cuestan: no relances un pipeline para confirmar lo que ya pasó. Revisa el estado con `gh` o con la API oficial, no con scripts sobre una sesión del navegador.
- `pnpm` bloquea los scripts de instalación. Si una dependencia nueva lo pide, lee qué hace antes de aprobarla en `allowBuilds`.

---
name: verificar-cambio
description: Corre las comprobaciones de este monorepo y reporta el resultado con evidencia. Úsala siempre antes de decir que algo está listo, antes de un commit o un PR, y cuando pidan revisar que todo pasa, correr las pruebas o comprobar un cambio.
---

# Verificar un cambio

Decir "listo" necesita evidencia: la salida de los comandos en esta corrida, no lo que debería pasar.

## 1. Mira qué cambió

```bash
git status --short
git diff --stat
```

## 2. Corre, en orden

Estas siempre, porque son rápidas y no usan red:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:layers
```

Después, según lo que cambió:

| Si tocaste…                                          | Corre                                                 |
| ---------------------------------------------------- | ----------------------------------------------------- |
| Una app o las capas de un producto                   | `pnpm turbo run test:e2e --filter=<app>`              |
| `libs/test-data`, `libs/utils` o la base de fixtures | `pnpm test:e2e`                                       |
| `Dockerfile`, `docker/` o `turbo.json`               | `docker compose build` y `docker compose run --rm qa` |
| La app Android                                       | `pnpm test:mobile`, si hay emulador                   |
| Solo documentación                                   | `pnpm format:check` alcanza                           |

Si algo falla, detente e investígalo con la skill `investigar-fallo` antes de seguir.

## 3. Lee la salida

- `✘` con `passed` en el resumen es un bug conocido con `test.fail`.
- Un test con `test.fail` que sale `failed` quizá dejó de fallar: el bug se arregló.
- Un test que pasó con un reintento (`flaky`) no está bien: dilo.

## 4. Reporta

```markdown
**Pasó:** <comando>: <resultado real, como "48 passed">
**Falló:** <comando>: <error y qué significa>
**No corrí:** <comando>: <motivo, como "no hay emulador">
```

Incluye siempre "No corrí" si algo quedó fuera. Nunca reportes como aprobado algo que no corriste.

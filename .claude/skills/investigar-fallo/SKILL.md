---
name: investigar-fallo
description: Encuentra la causa de un test que falla o es intermitente en este monorepo antes de cambiar nada. Úsala siempre que un test, un pipeline o una corrida de Docker falle, salga rojo, se quede colgado, pase a veces sí y a veces no, o alguien pregunte por qué falla algo.
---

# Investigar un fallo

El objetivo es la causa, no que el test pase. No cambies nada hasta poder explicar por qué falla.

## 1. Reproduce

Corre lo mínimo que muestre el fallo:

```bash
pnpm --filter <app> exec playwright test <archivo> -g "<nombre>" --project=<perfil>
```

Si no se reproduce, puede ser intermitente: repite con `--repeat-each=5` y prueba con `--workers=1`. Compara con otro perfil. Si solo falla en CI o en Docker, corre `docker compose run --rm qa`.

## 2. Lee la evidencia

- `test-results/<test>/error-context.md`: el error, el código y el estado de la página.
- Capturas y video en la misma carpeta, y el trace con `playwright show-trace <archivo>`.
- Reporte HTML: `pnpm --filter <app> exec playwright show-report`.
- App Android: `apps/my-demo-app-e2e/test-results/`, con captura y árbol de la pantalla.
- Fallos con datos: lee el mensaje de `loadEnvironment` o de `parseBody`. Dicen qué falta.

## 3. Clasifica

| Señal                                               | Causa probable     | Dónde se arregla                       |
| --------------------------------------------------- | ------------------ | -------------------------------------- |
| El locator no encuentra el elemento                 | La pantalla cambió | El page o el componente                |
| `Falta la variable`, `no cumple el esquema`         | Datos o ambiente   | `test-data`, `turbo.json`              |
| `no cumple el contrato`                             | Cambió la API      | `schemas.ts`, y avisa a la persona     |
| Lo esperado no coincide con lo que hace el producto | Bug del producto   | `test.fail`, y avisa a la persona      |
| Falla a veces, según los workers                    | Carga o carrera    | Mide y corrige la causa                |
| `Executable doesn't exist` en la imagen             | Variable filtrada  | `globalPassThroughEnv` en `turbo.json` |
| `instrumentation process is not running`            | Emulador           | Reinicia el emulador                   |
| Pipeline cancelado o cuenta restringida             | Servicio externo   | Avisa a la persona; no reintentes      |

## 4. Comprueba la hipótesis

Cambia una sola cosa y vuelve a correr. Si falla igual, descarta la hipótesis y deshaz el cambio.

No subas timeouts ni reintentos para que pase, no borres la aserción y no cambies lo que se espera. Si un bug del producto se marca con `test.fail`, confirma que falle por la aserción esperada.

## 5. Reporta

- **Qué falla:** test, perfil y comando para reproducirlo.
- **Causa:** con la evidencia que la demuestra.
- **Arreglo:** qué cambiaste y por qué, o qué propones.
- **Verificación:** cuántas veces pasó después. Si es intermitente, repítelo varias veces.

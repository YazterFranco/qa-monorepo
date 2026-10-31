# Trabajar con agentes

Guía para usar este repo con agentes de código como Claude Code, Codex, Cursor o Copilot. Son plantillas: no tienen datos de ninguna persona, y cualquiera que clone el repo puede usarlas tal como están.

## Qué hay

| Archivo                       | Para qué sirve                                        | ¿Se sube? |
| ----------------------------- | ----------------------------------------------------- | --------- |
| `AGENTS.md`                   | Instrucciones para cualquier agente                   | Sí        |
| `CLAUDE.md`                   | Importa `AGENTS.md` y agrega lo propio de Claude Code | Sí        |
| `.claude/rules/`              | Steering: buenas prácticas por tema                   | Sí        |
| `.claude/skills/`             | Procedimientos que el agente sigue paso a paso        | Sí        |
| `.claude/agents/`             | Subagentes especializados, de solo lectura            | Sí        |
| `.claude/settings.json`       | Permisos compartidos                                  | Sí        |
| `.mcp.json`                   | Servidores MCP, sin secretos                          | Sí        |
| `CLAUDE.local.md`             | Tus preferencias y datos personales                   | **No**    |
| `.claude/settings.local.json` | Tus permisos personales                               | **No**    |

`AGENTS.md` es la única fuente de instrucciones: `CLAUDE.md` lo importa con `@AGENTS.md`, para no mantener dos copias.

## Empezar

1. Instala el repo como dice el [README](../README.md#instalación).
2. Si quieres guardar datos o preferencias tuyas, crea tu copia local:

   ```bash
   cp CLAUDE.local.md.example CLAUDE.local.md
   ```

3. Abre el repo con tu agente. Claude Code pide confiar en la carpeta y aprobar el servidor MCP la primera vez.

Prueba con estas frases:

- "Agrega un escenario que ordene el inventario por nombre de la Z a la A."
- "Investiga por qué falla este test."
- "Revisa mi cambio antes del commit."

## Dónde va tu información

**En el repo, nada personal.** Correos, usuarios, nombres de cuentas y rutas de tu máquina van en `CLAUDE.local.md`. Git y Docker ignoran ese archivo.

| Dato                                   | Dónde va                                                    |
| -------------------------------------- | ----------------------------------------------------------- |
| Preferencias, tu rol, tu emulador      | `CLAUDE.local.md`                                           |
| Permisos solo para ti                  | `.claude/settings.local.json`                               |
| Un servidor MCP personal               | `claude mcp add --scope local <nombre> ...`, fuera del repo |
| Un token para un servidor MCP          | Una variable de entorno, referenciada como `${MI_TOKEN}`    |
| Credenciales de un ambiente de pruebas | Un secreto del CI, escrito como `${VAR}` en `test-data`     |

Un servidor con token se declara así, sin el valor:

```json
{
  "mcpServers": {
    "mi-servicio": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer ${MI_TOKEN}" }
    }
  }
}
```

## Steering

Las reglas de `.claude/rules/` son el steering del repo: buenas prácticas que el agente debe seguir. Claude Code carga `seguridad.md` siempre, y las demás al tocar las rutas de su encabezado:

```yaml
---
paths:
  - "libs/test-data/**"
---
```

Mantenlas cortas y con lo que no se ve en el código. Las reglas de cada capa ya están en su README; aquí solo van punteros y decisiones.

## Skills, subagentes y MCP

| Tipo      | Nombre                    | Qué hace                                              |
| --------- | ------------------------- | ----------------------------------------------------- |
| Skill     | `agregar-escenario`       | Agrega un escenario, capa por capa                    |
| Skill     | `investigar-fallo`        | Busca la causa de un fallo antes de cambiar nada      |
| Skill     | `verificar-cambio`        | Corre las comprobaciones y reporta qué pasó           |
| Subagente | `revisor-de-capas`        | Revisa un cambio contra las reglas y la privacidad    |
| Subagente | `analista-de-fallos`      | Investiga un fallo sin editar                         |
| Subagente | `explorador-de-pantallas` | Explora una página y propone selectores               |
| MCP       | `playwright`              | Navegador para explorar páginas, sin guardar sesiones |

Para GitHub no hace falta un servidor MCP: el CLI `gh` ya cubre lo necesario.

Agregar uno nuevo:

- **Skill:** crea `.claude/skills/<nombre>/SKILL.md`. La `description` decide cuándo se usa: di qué hace y en qué situaciones.
- **Subagente:** crea `.claude/agents/<nombre>.md` con `name`, `description` y solo las herramientas que necesite.
- **Regla:** crea `.claude/rules/<tema>.md` y súmala a la tabla de `AGENTS.md`.
- **MCP:** agrégalo a `.mcp.json` con su versión fija, y solo si confías en quien lo publica. Un servidor que trae contenido externo puede meter instrucciones falsas.

## Otras herramientas

| Herramienta            | Qué lee                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Codex, Cursor, Copilot | `AGENTS.md`. Las reglas, skills y subagentes están enlazados desde ahí                        |
| Kiro                   | Su steering vive en `.kiro/steering/`: copia o enlaza `.claude/rules/` y adapta el encabezado |

Cada herramienta configura MCP y permisos a su manera: `.mcp.json` y `.claude/settings.json` son de Claude Code.

## Lo que estas plantillas no garantizan

- **Las instrucciones son guía, no un candado.** Un agente puede saltarse `AGENTS.md`. Lo que se hace cumplir de verdad son ESLint, TypeScript, los hooks y los permisos.
- **`deny` no cubre todo.** `Read(./.env)` bloquea la herramienta de lectura, no un `cat .env` en la terminal. Para eso, usa el sandbox de Claude Code o no guardes secretos en archivos.
- **Tu usuario y correo salen en otros lugares.** Git los guarda en cada commit y las capturas pueden mostrarlos. Configura el correo `noreply` de GitHub y revisa las capturas antes de subirlas.
- **Revisa lo que publica un agente.** Antes de un push, mira el diff.

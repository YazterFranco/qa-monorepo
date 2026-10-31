# CLAUDE.md

@AGENTS.md

## Claude Code

Lo de arriba vale para cualquier agente. Esto es propio de Claude Code:

- **Reglas por tema:** las de `.claude/rules/` se cargan solas al tocar las rutas que indican. `seguridad.md` se carga siempre.
- **Skills:** `/agregar-escenario`, `/investigar-fallo` y `/verificar-cambio`, en `.claude/skills/`.
- **Subagentes:** `revisor-de-capas`, `analista-de-fallos` y `explorador-de-pantallas`, en `.claude/agents/`. Son de solo lectura.
- **MCP:** `.mcp.json` trae el servidor `playwright`, sin secretos. Cada persona lo aprueba la primera vez.
- **Permisos:** `.claude/settings.json` deja correr sin preguntar las comprobaciones y pide confirmación para hacer push. Bloquea leer `.env`.
- **Lo personal:** va en `CLAUDE.local.md`, que git ignora. La plantilla es [CLAUDE.local.md.example](CLAUDE.local.md.example).

Guarda en memoria lo que no se deduce del código. No guardes aquí preferencias personales: este archivo se sube al repo.

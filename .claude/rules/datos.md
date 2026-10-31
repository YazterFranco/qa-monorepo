---
paths:
  - "libs/test-data/**"
---

# Datos de prueba

Detalles en [libs/test-data/README.md](../../libs/test-data/README.md).

- Si el dato cambia entre ambientes, va en `environments/<ambiente>.json`. Si no, en `common/<dominio>.json`.
- Los archivos se nombran por ambiente o por dominio, nunca por uso: `products.json`, no `checkout-data.json`.
- Una clave nueva en `common/` necesita su lugar en `schema.ts`: el esquema es estricto y rechaza lo que no conoce.
- Cada credencial fuera de `public-demo` se escribe como `${VAR}`. Declara la variable en `passThroughEnv` de `turbo.json`, o Turbo no la deja pasar.
- El valor que _es_ el escenario, como un campo vacío, se queda en el spec.
- Los datos crean dependencias: el test de orden de `inventory.spec.ts` espera el catálogo completo de `products.json`. Si editas un catálogo, busca quién lo usa.
- Usa datos inventados. Nunca datos reales de personas, aunque el ambiente sea de pruebas.

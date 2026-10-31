---
paths:
  - "apps/**/*.ts"
  - "libs/**/*.ts"
  - "tests-of-layers/**/*.ts"
---

# Buenas prácticas de pruebas

Las reglas de cada capa están en su README: léelo antes de editar. Esto es lo que cruza todas las capas.

## Un buen test

- Prueba un comportamiento y su nombre dice el resultado: `usuario bloqueado: no entra y ve el error`.
- Se lee como negocio. Si un spec necesita un comentario para entender el flujo, falta un step.
- Prepara lo que necesita y no deja nada de lo que otro test dependa. Si hace falta un dato, créalo por API con un step.
- Puede fallar. Antes de darlo por bueno, comprueba que falla cuando el comportamiento se rompe.
- Varios casos con el mismo flujo son una tabla y un `for`, no specs copiados.

## Selectores

1. `getByRole` con su nombre visible.
2. `getByLabel` para campos.
3. `getByTestId`, con un atributo acordado con desarrollo.
4. CSS solo si la página no ofrece otra cosa, con un comentario que lo explique.

No uses IDs generados, rutas CSS largas ni posiciones como `nth-child`.

## Esperas

- Las aserciones `await expect(locator)` y las acciones de Playwright ya esperan. No agregues esperas fijas.
- Si algo tarda de verdad, sube el `timeout` de esa aserción y deja un comentario con el motivo.

## Fallos intermitentes

- Un test que falla a veces tiene una causa. Búscala antes de tocarlo.
- Mide con `--repeat-each=5` y prueba con distintos `--workers`, como se hizo con el perfil `iphone-15`.
- Los reintentos no son una solución. Si dejas uno, explica por qué.

## Bugs del producto

- El test describe el comportamiento correcto y se marca con `test.fail(condición, "motivo")`.
- Revisa que falle por la aserción esperada y no por un selector roto. Esto vale en cada perfil.
- No cambies lo que se espera para que el test pase.

## Pruebas de capas

- Si cambias un page, un step o un cliente, actualiza su prueba en `tests-of-layers`.
- Importan de `@playwright/test`, no de `fixtures`, y usan `createFakePage` o `createFakeRequest`.

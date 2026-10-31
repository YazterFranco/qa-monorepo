---
name: agregar-escenario
description: Agrega un escenario de prueba nuevo a este monorepo (web, API o Android) respetando las capas. Úsala siempre que pidan probar algo nuevo, cubrir un caso, agregar un test o spec, automatizar un flujo o validar una pantalla o un endpoint, aunque no digan "escenario".
---

# Agregar un escenario

Un escenario toca solo las capas donde falta algo. Antes de crear nada, revisa qué existe: casi siempre el page, el step y los datos ya están.

## 1. Entiende qué se prueba

Escribe en una frase el comportamiento y su resultado: "un usuario bloqueado no entra y ve el error". Identifica el producto y su app en `apps/`. Si no está claro qué es correcto, pregunta.

## 2. Busca lo que ya existe

Abre el spec más parecido de esa app, los pages que usa y `libs/test-data/<producto>`. Lee el README de cada capa que vayas a tocar.

## 3. Completa las capas, de abajo hacia arriba

Salta las que no necesiten cambios.

1. **Datos:** `libs/test-data/<producto>`. Si es un tipo nuevo, agrégalo a `schema.ts`.
2. **Page, screen o cliente:** locators o endpoints que falten. Sin aserciones ni datos.
3. **Componente:** solo si el bloque ya se usa en 2 o más pantallas.
4. **Step:** solo si la acción cruza pantallas, traduce un rol o prepara datos.
5. **Fixture:** solo si creaste una clase nueva que el spec debe recibir.

## 4. Escribe el spec

- Importa `test` y `expect` de `fixtures/<producto>`. En móvil, usa `@wdio/globals` y `myDemoApp(driver)`.
- Sin selectores, credenciales ni textos escritos.
- Si varios casos comparten flujo, usa una tabla y un `for`.
- Si el producto tiene un bug, escribe lo correcto y márcalo con `test.fail`.

## 5. Comprueba que el test sirve

- Córrelo solo, con `-g "<nombre>"`.
- En Sauce Demo corre en los 3 perfiles: revísalos todos.
- Hazlo fallar a propósito, cambiando temporalmente lo esperado, y vuelve a dejarlo como estaba. Un test que no puede fallar no prueba nada.

## 6. Cierra

- Si tocaste un page, un step o un cliente, actualiza su prueba en `tests-of-layers`.
- Agrega el escenario a la tabla del README de la app y actualiza las cifras de tests.
- Usa la skill `verificar-cambio` y reporta el resultado.

# tests-of-layers

Pruebas de cada capa por separado, sin navegador ni red. Corren en segundos y se ejecutan en CI antes de los e2e: si una capa se rompe, falla aquí con un mensaje claro y no en medio de un spec.

```bash
pnpm test:layers
```

Usan el runner de Playwright, pero ninguna pide la fixture `page`, así que no se abre navegador.

## Qué se prueba

| Carpeta                | Capa        | Cómo                                                        |
| ---------------------- | ----------- | ----------------------------------------------------------- |
| [test-data](test-data) | `test-data` | Carga ambientes reales y de ejemplo en `test-data/samples/` |
| [pages](pages)         | `pages`     | Con una page simulada que registra cada acción              |
| [steps](steps)         | `steps`     | Con la page simulada y un ambiente escrito en la prueba     |

## Page simulada

[support/fake-page.ts](support/fake-page.ts) implementa solo lo que usan pages y steps (`goto`, `getByLabel`, `getByRole`, `locator`, `fill`, `click`, `innerText`) y guarda cada acción como texto:

```ts
const { page, actions } = createFakePage();

await new LoginPage(page).login("ana", "clave-de-prueba");

expect(actions).toEqual([
  'fill label "Username" = ana',
  'fill label "Password" = clave-de-prueba',
  'click button "Login"',
]);
```

Si un page nuevo usa otro método de Playwright, agrégalo a la page simulada.

## Reglas

- **Archivos `*.test.ts`**, en la carpeta de la capa que prueban.
- **Datos inventados en la prueba o en `samples/`**, nunca credenciales reales.
- **Importan `test` y `expect` desde `@playwright/test`**, no desde `fixtures`: la fixture `auth` pide la `page`, y eso abre un navegador.

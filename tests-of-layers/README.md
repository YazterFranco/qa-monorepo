# tests-of-layers

Pruebas de cada capa por separado, sin navegador ni red. Corren en segundos y se ejecutan en CI antes de los e2e: si una capa se rompe, falla aquí con un mensaje claro y no en medio de un spec.

```bash
pnpm test:layers
```

Usan el runner de Playwright, pero ninguna pide la fixture `page`, así que no se abre navegador.

## Qué se prueba

| Carpeta                  | Capa                          | Cómo                                                                           |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| [test-data](test-data)   | `test-data`                   | Datos reales de cada producto y un producto de ejemplo en `test-data/samples/` |
| [pages](pages)           | `pages`                       | Con una page simulada que registra cada acción                                 |
| [components](components) | `components`                  | Con la page simulada, revisando que busque dentro de su contenedor             |
| [api](api)               | `api`                         | Con un `request` simulado que registra método, URL, cuerpo y cabeceras         |
| [steps](steps)           | `steps`                       | Con la page o el request simulados y datos escritos en la prueba               |
| [scripts](scripts)       | `new:app` y `remove:examples` | Generan y quitan productos en una carpeta temporal y revisan el resultado      |

Dentro de cada carpeta hay una subcarpeta por producto, igual que en `libs/`.

## Page simulada

[support/fake-page.ts](support/fake-page.ts) implementa solo lo que usan pages, components y steps (`goto`, `getByLabel`, `getByRole`, `getByTestId`, `locator`, `fill`, `click`, `selectOption`, `innerText`, `allInnerTexts`) y guarda cada acción como texto. Los locators encadenados se escriben con `>`:

```ts
const { page, actions } = createFakePage();

await new CheckoutSteps(page).completeOrder(customer);

expect(actions).toEqual([
  'click testid "header-container" > testid "shopping-cart-link"',
  'click testid "checkout"',
  'fill testid "firstName" = Ana',
  // ...
]);
```

Para que un locator devuelva textos, pásalos al crearla: `createFakePage({ 'testid "inventory-item-price"': ["$29.99"] })`.

Si un page nuevo usa otro método de Playwright, agrégalo a la page simulada.

[support/fake-request.ts](support/fake-request.ts) hace lo mismo para la API: registra cada llamada y responde lo que se le configure por `"MÉTODO /ruta"`.

Las screens de Android todavía no tienen pruebas de capa; se prueban con los specs móviles.

## Reglas

- **Archivos `*.test.ts`**, en la carpeta de la capa y el producto que prueban.
- **Datos inventados en la prueba o en `samples/`**, nunca credenciales reales.
- **Importan `test` y `expect` desde `@playwright/test`**, no desde `fixtures`: la fixture `auth` pide la `page`, y eso abre un navegador.

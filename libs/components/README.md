# components

Partes de la interfaz que aparecen en 2 o más pantallas: un menú, un modal, una tabla, un selector de fechas.

```
libs/components/
  index.ts        componentes compartidos entre productos (hoy ninguno)
  saucedemo/      header: carrito y menú lateral
  my-demo-app/    header, aviso de compatibilidad de Android y el helper androidId
```

Se importan como `components` (compartidos) o `components/<producto>`.

## Reglas

- **Solo se crea un componente cuando se usa en 2 o más lugares.** Mientras se use en una sola pantalla, sus locators viven en su page object.
- **API pública explícita.** Cada componente es una clase que expone propiedades y métodos con nombre de negocio, y se exporta en su `index.ts`. Los pages no tocan sus locators internos.
- **Recomendado:** que reciba su contenedor (un `Locator`) y busque todo dentro de él, así funciona en cualquier pantalla donde aparezca.
- **Sin aserciones**, igual que los pages.
- **No importa** `pages`, `steps`, `fixtures` ni `test-data`.
- Los locators y `data-testid` de los componentes comunes están pendientes de revisar con el equipo de desarrollo.

## Ejemplo

[saucedemo/header.component.ts](saucedemo/header.component.ts), que usan el inventario y el carrito:

```ts
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(root: Locator) {
    this.cartLink = root.getByTestId("shopping-cart-link");
    this.cartBadge = root.getByTestId("shopping-cart-badge");
    this.menuButton = root.getByRole("button", { name: "Open Menu" });
    this.logoutLink = root.getByTestId("logout-sidebar-link");
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
```

```ts
// En un page object
this.header = new Header(page.getByTestId("header-container"));
```

## Pruebas

[tests-of-layers/components](../../tests-of-layers/components): que busque dentro de su contenedor y que `logout` abra el menú antes de elegir la opción.

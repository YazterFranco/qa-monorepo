# pages

Un page object por pantalla, en una carpeta por producto. Sabe dónde están los elementos y cómo se usan; no sabe qué datos usar ni qué resultado esperar.

```
libs/pages/
  the-internet/   login
  saucedemo/      login, inventory, cart, checkout-info, checkout-overview, checkout-complete
  my-demo-app/    login, catalog, product, cart (screens de Android)
```

Se importan por producto: `import { InventoryPage } from "pages/saucedemo"`.

## Reglas

- **Un archivo por pantalla:** `<pantalla>.page.ts`, con una clase `<Pantalla>Page`. Se exporta en el `index.ts` del producto.
- **Locators como propiedades `readonly`**, con nombres que digan qué son en esa pantalla: `loginButton`, no `button`. Los que solo usan las acciones pueden ser `private`.
- **Selectores resistentes:** `getByRole`, `getByLabel` o un `data-testid` acordado con desarrollo. Nunca IDs técnicos ni rutas CSS largas.
- **Acciones básicas y compuestas:** `fillUsername`, `submit` y `login`, que las combina.
- **Sin aserciones.** Los specs hacen las aserciones sobre las propiedades del page. ESLint prohíbe importar `expect` aquí.
- **Reciben los datos como parámetros.** No importan `steps`, `fixtures` ni `test-data`; por eso [checkout-info.page.ts](saucedemo/checkout-info.page.ts) declara su propio tipo `CustomerInfo`.
- Si un locator o un bloque se repite en 2 o más pantallas, pasa a [components](../components).

## Ejemplo

[saucedemo/inventory.page.ts](saucedemo/inventory.page.ts), resumido:

```ts
export class InventoryPage {
  readonly header: Header; // componente compartido con el carrito y el checkout
  readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page.getByTestId("header-container"));
    this.itemPrices = page.getByTestId("inventory-item-price");
  }

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(productTestId("add-to-cart", productName)).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }
}
```

## Selectores de las demos

- **saucedemo** marca sus elementos con `data-test`. La app pone `testIdAttribute: "data-test"` en su config, así `getByTestId` los encuentra. El menú se abre por rol (`getByRole("button", { name: "Open Menu" })`), porque su `data-test` está en el ícono y no en el botón.
- **the-internet** no tiene `data-testid` ni rol en el aviso de login; `flashMessage` usa su atributo `[data-alert]`.

En las aplicaciones propias se usa el `data-testid` que se acuerde con desarrollo.

## Móvil

Las pantallas de Android se llaman `<pantalla>.screen.ts`, con una clase `<Pantalla>Screen` que recibe el `driver` de WebdriverIO. Los elementos son getters, porque WebdriverIO los busca de nuevo cada vez que se usan:

```ts
export class LoginScreen {
  constructor(private readonly driver: Browser) {}

  get loginButton() {
    return this.driver.$("~Tap to login with given credentials"); // accessibility id
  }

  get usernameError() {
    return this.driver.$(androidId("nameErrorTV")); // resource-id
  }
}
```

Las mismas reglas valen: sin aserciones (ESLint también prohíbe el `expect` de `@wdio/globals`) y sin datos.

## Pruebas

[tests-of-layers/pages](../../tests-of-layers/pages), con una page simulada que registra cada acción.

# components

Partes de la interfaz que aparecen en 2 o más pantallas: un menú, un modal, una tabla, un selector de fechas. Por ahora está vacía.

## Reglas

- **Solo se crea un componente cuando se usa en 2 o más lugares.** Mientras se use en una sola pantalla, sus locators viven en su page object.
- **API pública explícita.** Cada componente es una clase que expone propiedades y métodos con nombre de negocio, y se exporta en [index.ts](index.ts). Los pages no tocan sus locators internos.
- **Recomendado:** que reciba su contenedor (un `Locator`), así funciona en cualquier pantalla donde aparezca.
- **Sin aserciones**, igual que los pages.
- **No importa** `pages`, `steps`, `fixtures` ni `test-data`.
- Los locators y `data-testid` de los componentes comunes están pendientes de revisar con el equipo de desarrollo.

## Ejemplo

```ts
// libs/components/confirm-dialog.component.ts
import type { Locator } from "@playwright/test";

export class ConfirmDialog {
  readonly title: Locator;
  private readonly confirmButton: Locator;

  constructor(root: Locator) {
    this.title = root.getByRole("heading");
    this.confirmButton = root.getByRole("button", { name: "Confirmar" });
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }
}
```

```ts
// En un page object
this.deleteDialog = new ConfirmDialog(page.getByRole("dialog"));
```

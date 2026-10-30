# steps

Acciones de negocio que combinan uno o varios pages, en una carpeta por producto: iniciar sesión como un rol, agregar productos al carrito, completar una compra. Un spec las lee como frases.

```
libs/steps/
  the-internet/   auth
  saucedemo/      auth, cart, checkout
  restful-booker/ auth (pide el token), booking (crea reservas por API)
  my-demo-app/    auth, cart (Android)
```

## Reglas

- **Un archivo por dominio:** `<dominio>.steps.ts`, con una clase `<Dominio>Steps`. Se exporta en el `index.ts` del producto.
- **Métodos con verbos de negocio:** `loginAs`, `completeOrder`; no `clickSubmit`.
- **Reciben roles o datos, nunca selectores.** Tampoco usan `locator` ni `getBy*`: lo hacen a través de los pages. ESLint lo revisa.
- **Si necesitan el ambiente, lo reciben ya cargado** en el constructor, inyectado por las fixtures. No llaman a `loadEnvironment` por su cuenta.
- **Sin aserciones de resultado.** Esas las decide el spec.
- Si el dato pedido no existe, fallan con un mensaje que lista las opciones.
- **No importan** `fixtures`.

## Ejemplo

[saucedemo/checkout.steps.ts](saucedemo/checkout.steps.ts):

```ts
export class CheckoutSteps {
  constructor(private readonly page: Page) {}

  async enterCustomerInfo(customer: Customer): Promise<void> {
    await new InventoryPage(this.page).header.openCart();
    await new CartPage(this.page).checkout();

    const info = new CheckoutInfoPage(this.page);
    await info.fill(customer);
    await info.submit();
  }

  async completeOrder(customer: Customer): Promise<void> {
    await this.enterCustomerInfo(customer);
    await new CheckoutOverviewPage(this.page).finish();
  }
}
```

`enterCustomerInfo` existe por separado para los escenarios de validación: el spec manda un cliente con un campo vacío y revisa el error, sin terminar la compra.

En API, los steps preparan datos: `bookings.create(...)` crea una reserva y devuelve su id ya validado, para que el test se concentre en lo que prueba. En móvil, además, esperan a que cada pantalla nueva aparezca y cierran el aviso de compatibilidad de Android si sale.

Cada clase nueva se registra como fixture en `libs/fixtures/<producto>` para que los specs la reciban lista.

## Pruebas

[tests-of-layers/steps](../../tests-of-layers/steps), con la page simulada: el orden de las acciones y los errores con datos que no existen.

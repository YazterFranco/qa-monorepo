# steps

Acciones de negocio que combinan uno o varios pages: iniciar sesión como un rol, crear un pedido, cerrar un caso. Un spec las lee como frases.

## Reglas

- **Un archivo por dominio:** `<dominio>.steps.ts`, con una clase `<Dominio>Steps`. Se exporta en [index.ts](index.ts).
- **Métodos con verbos de negocio:** `loginAs`, `createOrder`; no `clickSubmit`.
- **Reciben roles o datos, nunca selectores.** Tampoco usan `locator` ni `getBy*`: lo hacen a través de los pages. ESLint lo revisa.
- **Reciben el ambiente ya cargado** en el constructor, inyectado por las fixtures. No llaman a `loadEnvironment` por su cuenta.
- **Sin aserciones de resultado.** Esas las decide el spec.
- Si el dato pedido no existe, fallan con un mensaje que lista las opciones.
- **No importan** `fixtures`.

## Ejemplo

[auth.steps.ts](auth.steps.ts):

```ts
export class AuthSteps {
  constructor(
    private readonly page: Page,
    private readonly environment: Environment,
  ) {}

  async loginAs(role: string): Promise<void> {
    const user = this.environment.users[role];
    if (!user) {
      throw new Error(`El ambiente no tiene un usuario con rol "${role}". ...`);
    }

    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(user.username, user.password);
  }
}
```

Cada clase nueva se registra como fixture en [libs/fixtures](../fixtures) para que los specs la reciban lista.

## Pruebas

[tests-of-layers/steps](../../tests-of-layers/steps), con una page simulada y un ambiente escrito en la prueba.

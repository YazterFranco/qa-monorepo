# pages

Un page object por pantalla. Sabe dónde están los elementos y cómo se usan; no sabe qué datos usar ni qué resultado esperar.

## Reglas

- **Un archivo por pantalla:** `<pantalla>.page.ts`, con una clase `<Pantalla>Page`. Se exporta en [index.ts](index.ts).
- **Locators como propiedades `readonly`**, con nombres que digan qué son en esa pantalla: `loginButton`, no `button`.
- **Selectores resistentes:** `getByRole`, `getByLabel` o un `data-testid` acordado con desarrollo. Nunca IDs técnicos ni rutas CSS largas.
- **Acciones básicas y compuestas:** `fillUsername`, `submit` y `login`, que las combina.
- **Sin aserciones.** Los specs hacen las aserciones sobre las propiedades del page. ESLint prohíbe importar `expect` aquí.
- **No importa** `steps`, `fixtures` ni `test-data`. Recibe los datos como parámetros.
- Si un locator o un bloque se repite en 2 o más pantallas, pasa a [components](../components).

## Ejemplo

[login.page.ts](login.page.ts), resumido:

```ts
export class LoginPage {
  readonly usernameInput: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel("Username");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/login"); // relativo a la baseURL del ambiente
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
```

`flashMessage` usa `[data-alert]` porque la demo pública no tiene `data-testid` ni rol en ese aviso. En las aplicaciones propias se usa el `data-testid` que se acuerde con desarrollo.

## Pruebas

[tests-of-layers/pages](../../tests-of-layers/pages), con una page simulada que registra cada acción.

import type { APIRequestContext } from "@playwright/test";
import { AuthClient, authFailureSchema, parseBody, tokenSchema } from "api/restful-booker";
import type { Environment } from "test-data";

export class AuthSteps {
  constructor(
    private readonly request: APIRequestContext,
    private readonly environment: Environment,
  ) {}

  /** Pide un token con el usuario del rol indicado. Falla con el motivo si la API no lo da. */
  async tokenFor(role: string): Promise<string> {
    const user = this.environment.users[role];
    if (!user) {
      const roles = Object.keys(this.environment.users).join(", ");
      throw new Error(
        `El ambiente no tiene un usuario con rol "${role}". Roles disponibles: ${roles}.`,
      );
    }

    const response = await new AuthClient(this.request).createToken(user);
    const body: unknown = await response.json();
    const failure = authFailureSchema.safeParse(body);
    if (failure.success) {
      throw new Error(`La API no dio token para "${role}": ${failure.data.reason}.`);
    }
    return (await parseBody(response, tokenSchema)).token;
  }
}

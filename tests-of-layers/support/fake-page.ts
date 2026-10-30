import type { Page } from "@playwright/test";

export interface FakePage {
  page: Page;
  /** Acciones en el orden en que el código bajo prueba las pidió. */
  actions: string[];
}

/** Page simulada: implementa solo lo que usan pages y steps, y registra cada acción. */
export function createFakePage(): FakePage {
  const actions: string[] = [];

  const locator = (target: string) => ({
    fill: (value: string) => {
      actions.push(`fill ${target} = ${value}`);
      return Promise.resolve();
    },
    click: () => {
      actions.push(`click ${target}`);
      return Promise.resolve();
    },
    innerText: () => Promise.resolve(`  texto de ${target}\n`),
  });

  const page = {
    goto: (url: string) => {
      actions.push(`goto ${url}`);
      return Promise.resolve(null);
    },
    getByLabel: (text: string) => locator(`label "${text}"`),
    getByRole: (role: string, options?: { name?: string }) =>
      locator(`${role} "${options?.name ?? ""}"`),
    locator: (selector: string) => locator(selector),
  };

  return { page: page as unknown as Page, actions };
}

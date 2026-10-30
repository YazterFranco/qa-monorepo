import type { Page } from "@playwright/test";

export interface FakePage {
  page: Page;
  /** Acciones en el orden en que el código bajo prueba las pidió. */
  actions: string[];
}

/**
 * Page simulada: implementa solo lo que usan pages, components y steps, y registra cada acción.
 * `texts` define lo que devuelven allInnerTexts/innerText para un locator, por su descripción:
 * { 'testid "inventory-item-price"': ["$9.99", "$29.99"] }.
 */
export function createFakePage(texts: Record<string, string[]> = {}): FakePage {
  const actions: string[] = [];

  const queries = (scope: string) => {
    const prefix = scope ? `${scope} > ` : "";
    return {
      getByLabel: (text: string) => locator(`${prefix}label "${text}"`),
      getByRole: (role: string, options?: { name?: string }) =>
        locator(`${prefix}${role} "${options?.name ?? ""}"`),
      getByTestId: (testId: string) => locator(`${prefix}testid "${testId}"`),
      locator: (selector: string) => locator(`${prefix}${selector}`),
    };
  };

  const locator = (target: string) => ({
    ...queries(target),
    fill: (value: string) => {
      actions.push(`fill ${target} = ${value}`);
      return Promise.resolve();
    },
    click: () => {
      actions.push(`click ${target}`);
      return Promise.resolve();
    },
    selectOption: (option: { label: string }) => {
      actions.push(`select ${target} = ${option.label}`);
      return Promise.resolve([]);
    },
    innerText: () => Promise.resolve(texts[target]?.[0] ?? `  texto de ${target}\n`),
    allInnerTexts: () => Promise.resolve(texts[target] ?? []),
  });

  const page = {
    ...queries(""),
    goto: (url: string) => {
      actions.push(`goto ${url}`);
      return Promise.resolve(null);
    },
  };

  return { page: page as unknown as Page, actions };
}

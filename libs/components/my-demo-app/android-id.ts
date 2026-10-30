export const APP_PACKAGE = "com.saucelabs.mydemoapp.android";

/** Selector por resource-id de la app: el equivalente Android de un data-testid. */
export function androidId(id: string): string {
  return `id=${APP_PACKAGE}:id/${id}`;
}

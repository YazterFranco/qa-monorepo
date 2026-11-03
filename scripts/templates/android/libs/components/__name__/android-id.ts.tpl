/** Paquete de la app Android (applicationId). Cámbialo si no es el de tu app. */
export const APP_PACKAGE = "[[package]]";

/** Selector por resource-id de la app: el equivalente Android de un data-testid. */
export function androidId(id: string): string {
  return `id=${APP_PACKAGE}:id/${id}`;
}

## Qué cambia y por qué

<!-- Una o dos frases. Si cierra un problema, enlázalo. -->

## Cómo se comprobó

Marca lo que corriste y pega lo que no pudiste correr, con el motivo:

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test:layers`
- [ ] `pnpm check:versions`, si tocaste una versión de Playwright, pnpm o Node
- [ ] `pnpm turbo run test:e2e --filter=<app>` de la app que tocaste
- [ ] Móvil: `pnpm test:mobile`, en local o en BrowserStack

## Lista de revisión

- [ ] Respeta las capas: sin selectores en specs ni steps, sin `expect` en pages, components ni api.
- [ ] Sin URLs, credenciales ni textos esperados escritos en specs, steps o pages.
- [ ] Sin datos personales, secretos ni capturas con cuentas o tokens.
- [ ] Si cambié un page, un step o un cliente, actualicé su prueba en `tests-of-layers`.
- [ ] Si cambié un comando, una regla o una carpeta, actualicé su documentación.
- [ ] No subí timeouts ni reintentos para esconder un fallo.

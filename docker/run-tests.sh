#!/usr/bin/env bash
# Corre las pruebas de capas y las e2e de web y API, y arma el reporte completo en reporte/:
# un reporte HTML de Playwright y un JUnit por paquete, más reporte/index.html con el resumen.
# Lo usan la imagen de Docker y el job docker-e2e de CircleCI. Sale con 1 si algo falló, pero
# siempre deja el reporte.
set -uo pipefail

PACKAGES=(tests-of-layers apps/the-internet-e2e apps/saucedemo-e2e apps/restful-booker-api)

status=0
pnpm test:layers || status=1
pnpm test:e2e || status=1

# reporte/ puede ser un volumen montado: se vacía en vez de borrarse.
mkdir -p reporte
find reporte -mindepth 1 -delete

for package in "${PACKAGES[@]}"; do
  name=$(basename "$package")
  if [ ! -d "$package/blob-report" ]; then
    echo "Sin resultados de $name: no llegó a correr." >&2
    status=1
    continue
  fi
  # En CI Playwright deja un reporte "blob"; aquí se convierte en HTML.
  (cd "$package" && pnpm exec playwright merge-reports --reporter html ./blob-report >/dev/null) || status=1
  mkdir -p "reporte/$name"
  cp -R "$package/playwright-report/." "reporte/$name/"
  cp "$package/test-results/junit.xml" "reporte/$name/junit.xml" 2>/dev/null || true
done

node docker/summary.mjs reporte || status=1
exit "$status"

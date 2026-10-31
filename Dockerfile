# Imagen con todo el monorepo listo para correr las pruebas de capas y las e2e de web y API.
# La app Android no corre aquí: necesita un emulador con aceleración por hardware.
#
#   docker compose run --rm qa        (o: docker build -t qa-monorepo . && docker run --rm --init --ipc=host qa-monorepo)
#
# La versión de la imagen base debe coincidir con @playwright/test del catálogo de pnpm: trae
# Node y los navegadores de esa versión.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

# CI: misma configuración de Playwright que en CircleCI (reintentos, reporters).
# HUSKY=0: sin git hooks dentro de la imagen.
ENV CI=true \
    HUSKY=0

# Misma versión que packageManager en package.json.
RUN npm install --global pnpm@12.16.1

WORKDIR /repo

# Primero solo el lockfile: los paquetes descargados quedan en una capa que Docker reutiliza
# mientras no cambien las dependencias.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

CMD ["./docker/run-tests.sh"]

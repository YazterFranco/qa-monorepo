{
  "name": "[[name]]-api",
  "private": true,
  "scripts": {
    "lint": "eslint .",
    "test:e2e": "playwright test",
    "typecheck": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "api": "workspace:*",
    "fixtures": "workspace:*",
    "utils": "workspace:*"
  },
  "devDependencies": {
    "@playwright/test": "catalog:",
    "@types/node": "catalog:",
    "eslint": "catalog:",
    "typescript": "catalog:"
  }
}

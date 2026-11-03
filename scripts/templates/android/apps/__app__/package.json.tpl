{
  "name": "[[app]]",
  "private": true,
  "scripts": {
    "app:upload": "node upload-app.ts",
    "lint": "eslint .",
    "test:mobile": "wdio run wdio.conf.ts",
    "typecheck": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "fixtures": "workspace:*",
    "pages": "workspace:*",
    "test-data": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@wdio/appium-service": "catalog:",
    "@wdio/cli": "catalog:",
    "@wdio/globals": "catalog:",
    "@wdio/local-runner": "catalog:",
    "@wdio/mocha-framework": "catalog:",
    "@wdio/spec-reporter": "catalog:",
    "appium": "catalog:",
    "appium-uiautomator2-driver": "catalog:",
    "eslint": "catalog:",
    "typescript": "catalog:",
    "webdriverio": "catalog:"
  }
}

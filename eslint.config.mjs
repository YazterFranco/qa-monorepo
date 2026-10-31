import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const LAYER_ORDER = "specs → fixtures → steps → pages | api → components";

/** Prohíbe que una capa importe a las que están por encima de ella, incluidas sus rutas por producto. */
function upperLayers(...names) {
  return names.map((name) => ({
    group: [name, `${name}/*`],
    message: `Una capa inferior no conoce a la superior (${LAYER_ORDER}).`,
  }));
}

const noAssertions = ["@playwright/test", "@wdio/globals"].map((name) => ({
  name,
  importNames: ["expect"],
  message: "Las aserciones van en los specs, no en pages, components ni api.",
}));

// Playwright: locator y getBy*. WebdriverIO: $ y $$, sueltos o como método.
const noSelectors = [
  {
    selector: "CallExpression[callee.property.name=/^(locator|getBy[A-Z]\\w*|\\$\\$?)$/]",
    message: "Los selectores van en los page objects.",
  },
  {
    selector: "CallExpression[callee.name=/^\\$\\$?$/]",
    message: "Los selectores van en los page objects.",
  },
];

// Producto móvil: corre con WebdriverIO y Mocha, no con el runner de Playwright.
const MOBILE = ["apps/my-demo-app-e2e/**", "libs/*/my-demo-app/**"];

export default defineConfig(
  globalIgnores([
    "**/node_modules/",
    "**/.turbo/",
    "**/test-results/",
    "**/playwright-report/",
    "**/blob-report/",
  ]),

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Scripts de Node fuera de los paquetes, como el resumen del reporte de Docker.
    files: ["docker/**/*.mjs"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },

  {
    files: ["**/*.ts"],
    ignores: MOBILE,
    extends: [playwright.configs["flat/recommended"]],
    rules: {
      "playwright/no-wait-for-timeout": "error",
      "playwright/no-element-handle": "error",
      "playwright/no-page-pause": "error",
    },
  },

  // Dirección de dependencias entre capas
  {
    files: ["libs/components/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: noAssertions,
          patterns: upperLayers("pages", "api", "steps", "fixtures", "test-data"),
        },
      ],
    },
  },
  {
    files: ["libs/pages/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: noAssertions, patterns: upperLayers("api", "steps", "fixtures", "test-data") },
      ],
    },
  },
  {
    files: ["libs/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: noAssertions,
          patterns: upperLayers("components", "pages", "steps", "fixtures", "test-data"),
        },
      ],
    },
  },
  {
    files: ["libs/steps/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: upperLayers("fixtures") }],
      "no-restricted-syntax": ["error", ...noSelectors],
    },
  },
  {
    files: ["libs/test-data/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: upperLayers("components", "pages", "api", "steps", "fixtures") },
      ],
    },
  },
  {
    files: ["libs/utils/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: upperLayers("components", "pages", "api", "steps", "fixtures") },
      ],
    },
  },
  {
    // Playwright exige desestructurar el primer argumento de una fixture, aunque no use nada.
    files: ["libs/fixtures/**/*.ts"],
    rules: { "no-empty-pattern": "off" },
  },
  {
    files: ["apps/**/*.spec.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@playwright/test",
              message: 'Importa test y expect desde "fixtures/<producto>".',
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", ...noSelectors],
    },
  },
);

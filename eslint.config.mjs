import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const LAYER_ORDER = "specs → fixtures → steps → pages → components";

/** Prohíbe que una capa importe a las que están por encima de ella. */
function upperLayers(...names) {
  return names.map((name) => ({
    name,
    message: `Una capa inferior no conoce a la superior (${LAYER_ORDER}).`,
  }));
}

const noAssertions = {
  name: "@playwright/test",
  importNames: ["expect"],
  message: "Las aserciones van en los specs, no en pages ni components.",
};

const noSelectors = {
  selector: "CallExpression[callee.property.name=/^(locator|getBy[A-Z]\\w*)$/]",
  message: "Los selectores van en los page objects.",
};

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
    files: ["**/*.ts"],
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
        { paths: [...upperLayers("pages", "steps", "fixtures", "test-data"), noAssertions] },
      ],
    },
  },
  {
    files: ["libs/pages/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: [...upperLayers("steps", "fixtures", "test-data"), noAssertions] },
      ],
    },
  },
  {
    files: ["libs/steps/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: upperLayers("fixtures") }],
      "no-restricted-syntax": ["error", noSelectors],
    },
  },
  {
    files: ["libs/test-data/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: upperLayers("components", "pages", "steps", "fixtures") },
      ],
    },
  },
  {
    files: ["libs/utils/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: upperLayers("components", "pages", "steps", "fixtures") },
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
              message: 'Importa test y expect desde "fixtures".',
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", noSelectors],
    },
  },
);

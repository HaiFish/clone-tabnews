import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";
import jest from "eslint-plugin-jest";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,

  {
    ignores: [".next/**", "node_modules/**"],
  },

  eslint.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        fetch: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["tests/**/*.js"],
    ...jest.configs["flat/recommended"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        fetch: "readonly",
      },
    },
  },

  eslintConfigPrettier,
];

export default config;

import tseslint from "typescript-eslint";

const { configs } = tseslint;

export default [
  {
    ignores: [".next/**", "node_modules/**", "app/generated/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  ...configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      ...cfg.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  })),
];

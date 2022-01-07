module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "standard-with-typescript",
    "prettier",
    "plugin:jest/recommended",
  ],
  plugins: ["@typescript-eslint", "jest", "prettier"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
      },
    },
  ],
  env: {
    jest: true,
    node: true,
    browser: true,
    "jest/globals": true,
  },
  rules: {
    "no-console": "error",
    "prettier/prettier": "error",
    "no-empty-pattern": "off",
    "jest/no-done-callback": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false,
        },
      },
    ],
  },
};

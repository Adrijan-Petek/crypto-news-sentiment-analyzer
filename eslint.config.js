const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['**/node_modules/**', 'reports/**', 'web/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['web/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  prettier,
];

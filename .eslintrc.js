module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['love', 'plugin:prettier/recommended'],
  ignorePatterns: ['.eslintrc.js', 'node_modules/'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};

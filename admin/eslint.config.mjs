// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
    },
  },
]);

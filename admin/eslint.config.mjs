// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    rules: {
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
    },
  },
]);

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/rules.test.ts'],
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});

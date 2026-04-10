import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**'],
    hookTimeout: 30000,
    testTimeout: 10000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    globalSetup: 'vite.env.ts',
    setupFiles: 'vite.setup.ts',
  },
})

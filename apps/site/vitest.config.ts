import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    env: {
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      SESSION_ENCRYPTION_KEY: 'fake-test-key-256bit-not-a-secret',
      BREVO_URL: 'https://api.brevo.test',
      BREVO_API_KEY: 'fake-test-brevo-api-key',
      // Tests exercise the failure paths: without this the suite prints the
      // lines it asserts on.
      // A level the app accepts: `env.server.ts` validates this variable, so a
      // test environment has to be a valid one. Tests assert on loggers they
      // configure themselves, so `fatal` keeps the output clean.
      LOG_LEVEL: 'fatal',
    },
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__mocks__/',
        '**/*.d.ts',
        '**/*.config.*',
        'cypress/',
        'public/',
        'src/app/globals.css',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Marker package that throws outside Next's `react-server` condition.
      'server-only': path.resolve(__dirname, './vitest.empty-module.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  assetsInclude: ['**/*.yaml'],
})

import eslint from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import vitest from '@vitest/eslint-plugin';
import nextVanilla from 'eslint-config-next';
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

const {import: _import, ...nextPlugins} = nextVanilla[0].plugins;

export default defineConfig([
  globalIgnores([
    'node_modules',
    'coverage',
    'dist',
    'apps/site/.next/**',
    'apps/site/build/**',
    'apps/site/next-env.d.ts',
    'apps/site/coverage/**',
    'apps/site/*.config.{js,ts}',
    'apps/site/check-memory.mjs',
    'apps/site/scripts/**/*',
    'apps/site/public/**/*',
    'apps/site/**/*.stories.tsx',
    'apps/site/.storybook/**',
    'apps/site/playwright-report/**',
    'apps/site/storybook-static/**',
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.ts', '.json'],
        },
      },
    },
  },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_.*$',
          varsIgnorePattern: '^_.*$',
        },
      ],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      'import/order': [
        'error',
        {
          groups: [
            ['internal', 'external', 'builtin'],
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
      'prefer-template': 'error',
    },
  },
  // Next.js and React related
  {
    // The only way to overload nextJS config with more aggressive ts-eslint rules
    ...nextVanilla[0],
    files: ['apps/site/**/*.{js,jsx,ts,tsx}'],
    ignores: ['apps/site/e2e/**/*'],
    plugins: nextPlugins,
    settings: {
      '@next/next': {
        rootDir: 'apps/site/',
      },
    },
    rules: {
      ...nextVanilla[0].rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-console': 'error',
      // @TODO: Remove this eslint-disable-next-line once we have a proper solution for these rules
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/static-components': 'warn',
      'react/no-unescaped-entities': [
        'error',
        {
          forbid: [
            {
              char: '>',
              alternatives: ['&gt;'],
            },
            {
              char: '}',
              alternatives: ['&#125;'],
            },
          ],
        },
      ],
      ...jsxA11y.configs.strict.rules,
      'jsx-a11y/no-redundant-roles': 'warn',
    }
  },
  // Extra rules from the previous Site eslint config
  // TODO: merge those rules with the root ts rules progressively
  {
    files: ['apps/site/**/*.{js,jsx,ts,tsx}'],
    extends: [
      typescriptEslint.configs.recommendedTypeChecked,
      typescriptEslint.configs.stylisticTypeChecked,
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',

      // @TODO : these should be error by default
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}','**/*.spec.{ts,tsx}'],
    ignores: ['**/e2e/**'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    files: ['tests/e2e/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
  },
  // Must be last to ensure compatibility with Prettier
  eslintConfigPrettier,
]);

import eslint from '@eslint/js'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import typescriptEslint from 'typescript-eslint'

export default [
  {
    ignores: ['node_modules', 'coverage', 'dist'],
  },
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
  eslintPluginPrettierRecommended,
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
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
]

import playwright from 'eslint-plugin-playwright'

export default {
  files: ['apps/site/e2e/**/*.ts'],
  ignores: ['apps/site/e2e/fixtures/feature-flags.ts'],
  extends: [playwright.configs['flat/recommended']],
  plugins: {
    'ngc-e2e': {
      rules: {
        'no-browser-newpage': {
          meta: {
            type: 'problem',
            docs: {
              description:
                'Use createPage(browser) instead of browser.newPage() to ensure feature flags are applied.',
            },
            messages: {
              useCreatePage:
                'Use createPage(browser) instead of browser.newPage() to ensure feature flags are applied.',
            },
            schema: [],
          },
          create(context) {
            return {
              'CallExpression[callee.object.name="browser"][callee.property.name="newPage"]'(
                node
              ) {
                context.report({ node, messageId: 'useCreatePage' })
              },
            }
          },
        },
      },
    },
  },
  rules: {
    'ngc-e2e/no-browser-newpage': 'error',
  },
}

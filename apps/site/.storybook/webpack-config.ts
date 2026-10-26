import type { StorybookConfig } from '@storybook/nextjs'
import path from 'node:path'

/**
 * Server-only modules that server components rendered by some stories pull into
 * the browser preview:
 *
 * - the server logger wires the Node OpenTelemetry SDK (`async_hooks`);
 * - server actions reach the Prisma client and its PostgreSQL driver.
 *
 * Modules listed here are replaced by browser-safe stubs. TsconfigPathsPlugin
 * resolves `@/...` before webpack aliases, so replacement happens on the
 * resolved module.
 */
const serverModuleReplacements: Array<[RegExp, string]> = [
  [/logger[\\/]logger\.server(\.ts)?$/, 'logger-server-stub.ts'],
  [/services[\\/]auth[\\/]get-user-session(\.ts)?$/, 'server-actions-stub.ts'],
  [
    /services[\\/]simulations[\\/]get-user-simulation-journey(\.ts)?$/,
    'server-actions-stub.ts',
  ],
]

export const webpackFinal: NonNullable<
  StorybookConfig['webpackFinal']
> = async (config) => {
  if (config.module?.rules) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    })
  }
  config.resolve = config.resolve ?? {}
  config.resolve.alias = {
    ...config.resolve.alias,
    // `next/root-params` throws when imported outside the Next compiler.
    'next/root-params': path.resolve(
      import.meta.dirname,
      'next-root-params-stub.ts'
    ),
  }
  config.plugins = config.plugins ?? []
  config.plugins.push({
    apply(compiler: any) {
      compiler.hooks.normalModuleFactory.tap(
        'ServerModuleStubs',
        (normalModuleFactory: any) => {
          const replace = (result: any) => {
            const request = result.request ?? result.createData?.resource
            if (!request) {
              return
            }
            const replacement = serverModuleReplacements.find(([pattern]) =>
              pattern.test(request)
            )
            if (!replacement) {
              return
            }
            const stub = path.resolve(import.meta.dirname, replacement[1])
            if (result.request) {
              result.request = stub
            }
            if (result.createData) {
              result.createData.resource = stub
            }
          }
          normalModuleFactory.hooks.beforeResolve.tap(
            'ServerModuleStubs',
            replace
          )
          normalModuleFactory.hooks.afterResolve.tap(
            'ServerModuleStubs',
            replace
          )
        }
      )
    },
  })
  return config
}

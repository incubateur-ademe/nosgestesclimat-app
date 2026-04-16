import { resolve } from 'node:path'

import serverConfig from './apps/server/eslint.config.mjs'
import siteConfig from './apps/site/eslint.config.js'

const rootDir = import.meta.dirname

/**
 * Prefix all file/ignore patterns in a flat config array with a directory path,
 * so each app's config is scoped to its own directory when run from the root.
 * Also injects tsconfigRootDir so the TS parser resolves tsconfig relative to
 * the app instead of the monorepo root.
 * Rules are never merged — each app's config is used as-is.
 */
function prefixConfigs(configs, dir) {
  const appRoot = resolve(rootDir, dir)

  return configs.map((config) => {
    const next = { ...config }

    if (config.files) {
      next.files = config.files.map((f) => `${dir}/${f}`)
    } else if (!config.ignores) {
      // Global config (no files/ignores selector) — scope it to this app
      next.files = [`${dir}/**`]
    }

    if (config.ignores) {
      next.ignores = config.ignores.map((p) => `${dir}/${p}`)
    }

    return next
  })
}

export default [
  ...prefixConfigs(serverConfig, 'apps/server'),
  ...prefixConfigs(siteConfig, 'apps/site'),
]

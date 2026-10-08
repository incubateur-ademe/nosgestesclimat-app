import type { NextConfig } from 'next'
import { version } from './package.json'

import createMDX from '@next/mdx'
import { withPostHogConfig } from '@posthog/nextjs-config'
import { SentryBuildOptions, withSentryConfig } from '@sentry/nextjs'

import redirects from './config/redirects.js'

import { remoteImagesPatterns } from './config/remoteImagesPatterns'
import { APP_ENV } from './src/env/app-env'
// The build validates the server contract like the server does: the same
// primitives (`requiredInProduction`, the one error shape), and a variable the
// upload needs is missing exactly where the build runs.
import { env } from './src/env/server'

const withMDX = createMDX({
  extension: /\.mdx$/,
})

/** Build-time inlined values the browser cannot read from `process.env` at
 * runtime. One source each — a twin left to hand drifts silently. */
const browserEnv = {
  ...(process.env.SOURCE_VERSION
    ? { NEXT_PUBLIC_APP_VERSION: process.env.SOURCE_VERSION }
    : {}),
  ...(process.env.SENTRY_DSN
    ? { NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN }
    : {}),
}

const nextConfig = withMDX({
  env: browserEnv,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  transpilePackages: ['@nosgestesclimat/core'],
  images: {
    remotePatterns: remoteImagesPatterns,
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    const enRedirects = redirects
      .filter(
        (r) =>
          !r.source.startsWith('/en/') &&
          !r.source.startsWith('/fr/') &&
          !r.source.includes('%')
      )
      .map((r) => ({
        ...r,
        source: `/en${r.source}`,
        destination: r.destination.startsWith('http')
          ? r.destination
          : `/en${r.destination}`,
      }))

    return [...redirects, ...enRedirects]
  },
  // CMS assets are served from S3 by nginx in prod, but Next's image optimizer
  // fetches them via an internal request that bypasses nginx. Without this
  // rewrite, that request gets a 404 and the optimizer returns 400.
  async rewrites() {
    return [
      {
        source: '/_static/cms/:path*',
        destination:
          'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/:path*',
      },
    ]
  },
  productionBrowserSourceMaps: true,
  turbopack: {
    root: new URL('../../', import.meta.url).pathname,
    rules: {
      '*.yaml': {
        loaders: ['yaml-loader'],
        as: '*.js',
      },
      '*.yml': {
        loaders: ['yaml-loader'],
        as: '*.js',
      },
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['@incubateur-ademe/nosgestesclimat'],
    webpackBuildWorker: true,
    authInterrupts: true,
    mdxRs: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    })

    return config
  },
} satisfies NextConfig)

// One release everywhere: the deployed commit SHA, the same string as
// `service.version` — the deploy env already records the environment.
const releaseName = process.env.SOURCE_VERSION ?? version
const sentryConfig: SentryBuildOptions = {
  // Suppresses source map uploading logs during dev build
  silent: APP_ENV !== 'production',
  org: 'incubateur-ademe',
  project: 'nosgestesclimat-nextjs',
  release: {
    name: releaseName,
    setCommits: {
      auto: true,
    },
    deploy: {
      env: APP_ENV,
    },
  },
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: APP_ENV !== 'development',
  telemetry: false,
}

/** Source maps uploaded to PostHog at build time, then stripped from the
 * output. Serving them live would break on rotating chunk names and publish
 * sources. Skipped locally where there is nothing to symbolicate. */
const configWithSourceMaps =
  env.POSTHOG_PERSONAL_API_KEY && env.POSTHOG_PROJECT_ID
    ? withPostHogConfig(nextConfig, {
        personalApiKey: env.POSTHOG_PERSONAL_API_KEY,
        projectId: env.POSTHOG_PROJECT_ID,
        // The project is on the EU instance; the package defaults to the US one.
        host: 'https://eu.posthog.com',
        sourcemaps: {
          // The same release string as `service.version` and the Sentry release
          // when the build knows it; the package falls back to the git commit.
          ...(env.SOURCE_VERSION ? { releaseVersion: env.SOURCE_VERSION } : {}),
        },
      })
    : nextConfig

export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(configWithSourceMaps, sentryConfig)
  : configWithSourceMaps

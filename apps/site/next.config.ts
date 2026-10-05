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

/**
 * What the browser bundle cannot read from its process, inlined at build time:
 * the released commit and the Sentry DSN, which the server and the worker read
 * from their environment at runtime. One source each — a `NEXT_PUBLIC_` twin
 * left to hand drifts silently, and a browser without a DSN reports nothing.
 */
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
  // Les assets du CMS sont référencés sous /_static/cms/.
  //
  // En prod/preprod, c'est nginx qui les sert depuis S3 (cache immutable) : les
  // requêtes du navigateur n'atteignent jamais Next.js. Mais l'optimiseur
  // d'images récupère les images locales par une requête interne vers l'app
  // (`/_next/image?url=/_static/cms/…`), et nginx réécrit le `Host` vers l'app
  // Scalingo : cette requête interne ne traverse donc pas nginx. Sans ce proxy,
  // elle reçoit un 404 et l'optimiseur répond 400.
  //
  // On proxy donc /_static/cms/ vers S3 dans tous les environnements.
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

/**
 * Source maps reach PostHog at build time, browser chunks and server ones alike
 * (the package globs `.next/static` and `.next/server`, uploads, then strips
 * the maps from the build output). Serving them instead — what
 * `productionBrowserSourceMaps` alone did — left PostHog fetching them from the
 * live site: a fetch that a deploy's rotating chunk names eventually break, and
 * that publishes the sources.
 *
 * In production the contract above makes the key and the project id mandatory,
 * so this branch is only skipped where there is nothing to symbolicate: a local
 * `next build` is a production build that deploys nothing (`APP_ENV`).
 */
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

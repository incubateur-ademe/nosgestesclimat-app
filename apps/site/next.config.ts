import type { NextConfig } from 'next'
import { version } from './package.json'

import createMDX from '@next/mdx'
import { SentryBuildOptions, withSentryConfig } from '@sentry/nextjs'

import redirects from './config/redirects.js'

import { APP_ENV } from './config/app-env'
import { remoteImagesPatterns } from './config/remoteImagesPatterns'

const withMDX = createMDX({
  extension: /\.mdx$/,
})

const nextConfig = withMDX({
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

const releaseName = `${process.env.SOURCE_VERSION ?? version}-${process.env.APP ?? APP_ENV}`
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

export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig

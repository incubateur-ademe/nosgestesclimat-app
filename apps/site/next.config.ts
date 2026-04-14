import type { NextConfig } from 'next'
import { version } from './package.json'

import createMDX from '@next/mdx'
import { SentryBuildOptions, withSentryConfig } from '@sentry/nextjs'

import redirects from './config/redirects.js'

import { APP_ENV } from './config/app-env'
import { remoteImagesPatterns } from './config/remoteImagesPatterns'
import { PROXY_SERVER } from './config/urls'

const withMDX = createMDX({
  extension: /\.mdx$/,
})

// Use rewrite rules to proxy requests from the client to the server when both are on different domain (preview app / local)

const rewrites = PROXY_SERVER
  ? {
      rewrites: () => [
        {
          source: '/api/server/:path*',
          destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/:path*`,
        },
      ],
    }
  : {}

const nextConfig = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    remotePatterns: remoteImagesPatterns,
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    return redirects
  },
  productionBrowserSourceMaps: false,
  outputFileTracingExcludes: {
    '*': ['.next/cache/webpack', '.git/**/*', 'cypress/**/*'],
  },
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
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@incubateur-ademe/nosgestesclimat'],
    webpackBuildWorker: true,
    authInterrupts: true,
    mdxRs: true,
    useCache: true,
  },

  ...rewrites,
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

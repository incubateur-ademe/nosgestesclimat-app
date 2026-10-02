/**
 * The requests that serve a file, not a page.
 *
 * `HttpInstrumentation` traces everything that reaches the Node server, and
 * these carry no operation worth a span: nobody investigates the trace of a
 * favicon. The prefixes mirror what the proxy matcher already excludes — the
 * assets Next serves, the CMS media rewritten to S3 (`next.config.ts`), the
 * public directories — plus the asset extensions the CMS hands over by URL.
 */
const STATIC_PREFIXES = [
  '/_next/',
  '/_static/',
  '/images/',
  '/scripts/',
  '/demos/',
  '/misc/',
  '/videos/',
]

const STATIC_FILES = [
  '/favicon.ico',
  '/favicon.png',
  '/manifest.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
]

const ASSET_EXTENSION =
  /\.(avif|bmp|css|gif|ico|jpe?g|js|map|mp4|png|svg|webm|webp|woff2?)$/i

export function isStaticRequest(url: string | undefined): boolean {
  // `request.url` is the path, query string included when there is one.
  const path = url?.split('?')[0]

  if (!path) {
    return false
  }

  return (
    STATIC_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    STATIC_FILES.includes(path) ||
    ASSET_EXTENSION.test(path)
  )
}

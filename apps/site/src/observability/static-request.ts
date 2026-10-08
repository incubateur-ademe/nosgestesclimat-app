/** Requests that serve a file, not a page. Mirrors the proxy matcher
 * exclusions, kept in step by hand. */
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

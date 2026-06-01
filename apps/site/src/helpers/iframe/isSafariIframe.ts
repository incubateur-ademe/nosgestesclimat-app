/**
 * Detect if the request comes from a Safari-based browser in an iframe context.
 * Used to identify scenarios where third-party cookies are blocked
 * (e.g., WKWebView on iOS, Safari private browsing with cross-origin iframes).
 */
export function isSafariIframe(headersList: Headers): boolean {
  const userAgent = headersList.get('user-agent') ?? ''
  const referer = headersList.get('referer') ?? ''
  const secFetchSite = headersList.get('sec-fetch-site') ?? ''

  // Must be Safari/WebKit (not Chrome, Firefox, etc.)
  const isWebKit =
    /AppleWebKit/i.test(userAgent) &&
    /Safari/i.test(userAgent) &&
    !/Chrome/i.test(userAgent)

  if (!isWebKit) return false

  // In an iframe, the referer is the host page (different origin)
  // Sec-Fetch-Site: cross-site also indicates an iframe embed
  return secFetchSite === 'cross-site' || !!referer
}

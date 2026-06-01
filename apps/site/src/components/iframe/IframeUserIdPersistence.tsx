'use client'

import { useEffect } from 'react'

const NGC_USER_ID_KEY = '__NGC_USER_ID__'
const NGC_USER_ID_HEADER = 'x-ngc-user-id'

/**
 * Persists the anonymous userId across navigations inside an iframe
 * when third-party cookies are blocked (Safari, WKWebView).
 *
 * Strategy:
 * 1. Server embeds the userId in the HTML via a <script> tag
 * 2. This component stores it in window.name (survives navigations)
 * 3. A fetch interceptor adds x-ngc-user-id header on same-origin requests
 * 4. The middleware reads this header and reuses the userId
 */
export default function IframeUserIdPersistence({
  userId,
}: {
  userId: string
}) {
  useEffect(() => {
    // Expose for other scripts (e.g., the server-embedded <script> tag
    // can set window.__NGC_USER_ID__ before hydration, and we read it here)
    const initialUserId =
      (window as unknown as Record<string, string>)[NGC_USER_ID_KEY] || userId

    // Persist across navigations within the same iframe context
    window.name = initialUserId

    // Intercept fetch to include the userId on same-origin requests.
    // This covers RSC navigations (Next.js <Link>), server actions,
    // and any fetch() to our own API.
    const originalFetch = window.fetch.bind(window)
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString()

      if (url.startsWith('/') || url.startsWith(window.location.origin)) {
        const headers = new Headers(init?.headers)
        if (!headers.has(NGC_USER_ID_HEADER)) {
          headers.set(NGC_USER_ID_HEADER, window.name || userId)
        }
        return originalFetch(input, { ...init, headers })
      }

      return originalFetch(input, init)
    }
  }, [userId])

  return null
}

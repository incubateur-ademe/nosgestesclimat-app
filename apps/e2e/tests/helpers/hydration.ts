import type { Page } from '@playwright/test'

/**
 * Matches what React (and Next.js, which forwards its recoverable errors) raises
 * when the server HTML and the client render disagree. The codes are the
 * minified production ones — dev builds log the same errors with a full diff.
 *
 * Next.js already reports these as uncaught errors: its `onRecoverableError`
 * calls `reportError()` ("emulating an uncaught JavaScript error", see
 * `next/dist/client/react-client-callbacks/report-global-error.js`). Nothing in
 * `next.config.js` can change that — but it means a page error is enough to
 * catch them, both in the browser console and in error reporting.
 */
export const HYDRATION_MISMATCH_PATTERN =
  /hydrat|didn't match|did not match|#418|#423|#425/i

export interface HydrationMismatch {
  /** Path the page was on when the error was raised. */
  path: string
  /** The browser error itself. */
  detail: string
}

/**
 * Collects the hydration mismatches reported while the page lives.
 *
 * A mismatch is not a cosmetic warning: React drops the server HTML and
 * regenerates the whole tree on the client, so a full re-render happens with
 * the main thread blocked — which is how the e2e suite used to lose the click
 * on the group's copy button (`helpers/clipboard.ts`).
 */
export function watchHydrationMismatches(page: Page): HydrationMismatch[] {
  const mismatches: HydrationMismatch[] = []

  const record = (detail: string) => {
    mismatches.push({
      path: safePathname(page.url()),
      detail: detail.slice(0, 4000),
    })
  }

  page.on('pageerror', (error) => {
    if (HYDRATION_MISMATCH_PATTERN.test(error.message)) {
      record(`[pageerror] ${error.message.split('\n')[0]}`)
    }
  })

  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      HYDRATION_MISMATCH_PATTERN.test(message.text())
    ) {
      record(`[console] ${message.text()}`)
    }
  })

  return mismatches
}

function safePathname(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

/**
 * React reports a mismatch a few hundred milliseconds *after* the `load` event
 * (measured on this app: 70 to 360 ms after `load`), and the app publishes no
 * "hydrated" signal to wait for. A test that ends before that delay cannot see
 * one, so the guard watches each page for at least this long after it loaded.
 */
export const HYDRATION_SETTLE_MS = 750

/** Time left to wait before the page has been observed long enough. */
export function settleBudget(loadedAt: number) {
  return loadedAt === 0
    ? 0
    : Math.max(0, HYDRATION_SETTLE_MS - (Date.now() - loadedAt))
}

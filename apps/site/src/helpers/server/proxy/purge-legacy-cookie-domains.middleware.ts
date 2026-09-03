import {
  AUTH_COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { getCookieOptions } from '@/helpers/server/cookie/helpers'
import type { CookieToSet } from '@/helpers/server/cookie/types'
import { type NextRequest, NextResponse } from 'next/server'

// No legacy domain-scoped cookie can outlive 180 days: delete this whole file
// after 2027-04-01.
const LEGACY_COOKIE_MIGRATION_UNTIL_MS = Date.parse('2027-04-01T00:00:00Z')

// Legacy cookies were scoped to the deployment's hostname: only prod (apex)
// and preprod ever issued one, so we purge both.
const LEGACY_COOKIE_DOMAINS = [
  'nosgestesclimat.fr',
  'preprod.nosgestesclimat.fr',
]

export interface LegacyCookieDomainPurgeResult {
  cookies: CookieToSet[]
  rawSetCookies: string[]
}

/**
 * Temporary cleanup for cookies issued before this change: they were scoped
 * to the whole `nosgestesclimat.fr` domain, so cookies set by prod were also
 * sent to preprod, which then read prod sessions. Browsers keep those cookies
 * for up to 180 days, so this cleanup runs until
 * `LEGACY_COOKIE_MIGRATION_UNTIL_MS` and replaces them with cookies that only
 * work on the environment that set them.
 */
export function middlewarePurgeLegacyCookieDomains(
  request: NextRequest,
  freshCookies: CookieToSet[]
): LegacyCookieDomainPurgeResult {
  // Set-Cookie would prevent cacheable responses from being cached: only run
  // for requests carrying a session cookie (those are never cached).
  if (
    Date.now() >= LEGACY_COOKIE_MIGRATION_UNTIL_MS ||
    !request.cookies.has(SESSION_COOKIE)
  ) {
    return { cookies: [], rawSetCookies: [] }
  }

  // The request exposes names and values only, not attributes: a host-only
  // cookie is indistinguishable from a domain-scoped one, so purge on name
  // presence (a no-op when only the host-only variant exists).
  const legacyNames = [SESSION_COOKIE, REFRESH_COOKIE].filter((name) =>
    request.cookies.has(name)
  )

  const rawSetCookies = legacyNames.flatMap((name) =>
    LEGACY_COOKIE_DOMAINS.map((domain) =>
      serializePurgeCookie(name, { ...getCookieOptions(), domain, maxAge: 0 })
    )
  )

  const cookies = legacyNames
    .filter((name) => !freshCookies.some((cookie) => cookie.name === name))
    .map((name) => ({
      name,
      value: request.cookies.get(name)!.value,
      options: { ...getCookieOptions(), maxAge: AUTH_COOKIE_MAX_AGE },
    }))

  return { cookies, rawSetCookies }
}

function serializePurgeCookie(
  name: string,
  options: CookieToSet['options']
): string {
  const response = NextResponse.next()
  response.cookies.set(name, '', options)
  return response.headers.getSetCookie()[0] ?? ''
}

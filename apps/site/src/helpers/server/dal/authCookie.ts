import type { SessionOptions } from 'iron-session'

export const SERVER_AUTH_COOKIE_NAME =
  process.env.SERVER_AUTH_COOKIE_NAME ?? 'ngc_server_auth_jwt'

const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
const secure = domain !== 'localhost'

/**
 * Default cookie options for modern browsers (Chrome, Firefox, Safari 17+).
 * Uses Partitioned (CHIPS) + SameSite=None for iframe embedding support.
 */
export const DEFAULT_COOKIE_OPTION: SessionOptions['cookieOptions'] = {
  httpOnly: true,
  secure,
  partitioned: secure,
  sameSite: secure ? 'none' : 'strict', // NGC can be embedded in iframe
  domain,
}

/**
 * Safe cookie options for legacy Safari < 17.
 *
 * Safari < 17 does not support the `Partitioned` attribute (CHIPS) and may
 * silently drop the entire cookie when it encounters an unknown attribute.
 * It may also reject cookies with an explicit `Domain` attribute.
 *
 * We use SameSite=Lax (instead of None) because:
 * - Outside iframes: works identically
 * - Inside iframes: the Storage Access API (IframeCookieBlocker) grants
 *   access, and once granted, all SameSite levels are included.
 */
export const LEGACY_SAFARI_COOKIE_OPTION: SessionOptions['cookieOptions'] = {
  httpOnly: true,
  secure,
  sameSite: secure ? 'lax' : 'strict',
  // No `domain` — Safari may reject cookies with explicit Domain
  // No `partitioned` — not supported by Safari < 17
}

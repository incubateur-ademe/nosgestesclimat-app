import type { SessionOptions } from 'iron-session'

export const SERVER_AUTH_COOKIE_NAME =
  process.env.SERVER_AUTH_COOKIE_NAME ?? 'ngc_server_auth_jwt'

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!)
const secure = siteUrl.hostname !== 'localhost'

// When frontend and backend have different origins (Scalingo previews),
// the cookie needs Domain to be shared. When same-origin (production),
// we use Partitioned (CHIPS) so the cookie survives in cross-site iframes.
// Partitioned + Domain is invalid per the CHIPS spec: they are mutually exclusive.
const serverHost = new URL(
  process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://localhost:3001'
).host
const isCrossOrigin = !serverHost.endsWith(siteUrl.host)

export const DEFAULT_COOKIE_OPTION: SessionOptions['cookieOptions'] = {
  httpOnly: true,
  secure,
  sameSite: secure ? 'none' : 'strict', // NGC can be embeded in iframe
  ...(isCrossOrigin ? { domain: siteUrl.hostname } : { partitioned: true }),
}

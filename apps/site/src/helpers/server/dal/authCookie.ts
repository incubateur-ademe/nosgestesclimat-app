import type { SessionOptions } from 'iron-session'

export const SERVER_AUTH_COOKIE_NAME =
  process.env.SERVER_AUTH_COOKIE_NAME ?? 'ngc_server_auth_jwt'

const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
const secure = domain !== 'localhost'

export const DEFAULT_COOKIE_OPTION: SessionOptions['cookieOptions'] = {
  httpOnly: true,
  secure,
  partitioned: secure,
  sameSite: secure ? 'none' : 'strict', // NGC can be embeded in iframe
  domain,
}

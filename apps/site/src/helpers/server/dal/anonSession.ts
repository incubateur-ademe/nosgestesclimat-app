import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import type { UserRegion } from '../model/models'
import { DEFAULT_COOKIE_OPTION } from './authCookie'

export interface AnonSessionData {
  userId?: string
  region?: UserRegion
  initialRegion?: UserRegion
}

if (!process.env.IRON_SESSION_PASSWORD) {
  throw new Error(
    'IRON_SESSION_PASSWORD environment variable is required. It must be at least 32 characters long.'
  )
}

const TWO_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 2

export const anonSessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD,
  cookieName: 'ngc_anon_user',
  ttl: TWO_YEARS_IN_SECONDS,
  cookieOptions: DEFAULT_COOKIE_OPTION,
}

export async function getAnonSession() {
  return getIronSession<AnonSessionData>(await cookies(), anonSessionOptions)
}

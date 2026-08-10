import { getClientCookie } from '@/utils/cookie'

export const USER_TIME_ZONE_COOKIE = 'ngc_tz'

// The events are French-only; keep Paris as the fallback until the visitor's
// timezone is known (first request has no cookie yet).
export const FALLBACK_TIME_ZONE = 'Europe/Paris'

const supportedTimeZones = (() => {
  try {
    return new Set(Intl.supportedValuesOf('timeZone'))
  } catch {
    // Older engines do not implement Intl.supportedValuesOf.
    return null
  }
})()

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false
  if (supportedTimeZones) return supportedTimeZones.has(timeZone)
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

export function getBrowserTimeZone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timeZone && isValidTimeZone(timeZone) ? timeZone : FALLBACK_TIME_ZONE
}

export function setUserTimeZoneCookie() {
  if (typeof document === 'undefined') return
  if (getClientCookie(USER_TIME_ZONE_COOKIE)) return
  // IANA names contain '/', which cookie parsers decode on both sides.
  const value = encodeURIComponent(getBrowserTimeZone())
  document.cookie = `${USER_TIME_ZONE_COOKIE}=${value}; path=/; SameSite=None; Secure; max-age=31536000`
}

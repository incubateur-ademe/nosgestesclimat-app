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
  // IANA names only contain letters, digits, '/' and '_', all allowed in a
  // cookie value (RFC 6265): no encoding needed.
  document.cookie = `${USER_TIME_ZONE_COOKIE}=${getBrowserTimeZone()}; path=/; SameSite=None; Secure; max-age=31536000`
}

import {
  FALLBACK_TIME_ZONE,
  USER_TIME_ZONE_COOKIE,
  isValidTimeZone,
} from '@/helpers/date/userTimeZone'
import { cookies } from 'next/headers'

// Cookies written before we stopped encoding IANA names (e.g.
// "Europe%2FParis") are still valid: decode them defensively.
function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function getUserTimeZone(): Promise<string> {
  const cookieStore = await cookies()
  const timeZone = safeDecodeURIComponent(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value ?? ''
  )
  return timeZone && isValidTimeZone(timeZone) ? timeZone : FALLBACK_TIME_ZONE
}

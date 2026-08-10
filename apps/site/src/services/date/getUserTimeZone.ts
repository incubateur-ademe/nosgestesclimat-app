import {
  FALLBACK_TIME_ZONE,
  USER_TIME_ZONE_COOKIE,
  isValidTimeZone,
} from '@/helpers/date/userTimeZone'
import { cookies } from 'next/headers'

export async function getUserTimeZone(): Promise<string> {
  const cookieStore = await cookies()
  const timeZone = cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  return timeZone && isValidTimeZone(timeZone) ? timeZone : FALLBACK_TIME_ZONE
}

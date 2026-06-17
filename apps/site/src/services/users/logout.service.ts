'use server'

import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/proxy/auth/cookies'
import { getCookieOptions } from '@/helpers/server/proxy/cookies'
import { cookies } from 'next/headers'

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const options = getCookieOptions()

  cookieStore.delete({ name: SESSION_COOKIE, ...options })
  cookieStore.delete({ name: REFRESH_COOKIE, ...options })
}

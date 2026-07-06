import type { CookieToSet } from '@/helpers/server/cookie/types'
import type { NextResponse } from 'next/server'

export interface MiddlewareResult {
  redirect: NextResponse | null
  cookies: CookieToSet[]
}

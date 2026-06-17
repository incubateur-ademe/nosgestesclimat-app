import type { NextResponse } from 'next/server'

type CookieOptions = NonNullable<
  Parameters<NextResponse['cookies']['set']>[2]
>

export interface CookieToSet {
  name: string
  value: string
  options?: Partial<CookieOptions>
}

export interface MiddlewareResult {
  redirect: NextResponse | null
  cookies: CookieToSet[]
}

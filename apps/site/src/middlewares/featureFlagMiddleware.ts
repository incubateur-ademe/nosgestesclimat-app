import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import {
  parseFeatureFlagCookie,
  parseFeatureFlagParams,
  stripFeatureFlagParams,
} from '@/services/feature-flags/urlParams'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const secure =
  new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname !== 'localhost'

export async function featureFlagMiddleware(
  request: NextRequest,
  next: (req: NextRequest) => NextResponse | Promise<NextResponse>
): Promise<NextResponse> {
  const incoming = parseFeatureFlagParams(request.nextUrl.searchParams)
  if (!incoming) return next(request)

  const existing = parseFeatureFlagCookie(
    request.cookies.get(FF_COOKIE_NAME)?.value
  )
  const merged = { ...existing, ...incoming }

  const response = NextResponse.redirect(
    stripFeatureFlagParams(request.nextUrl)
  )
  response.cookies.set(FF_COOKIE_NAME, JSON.stringify(merged), {
    secure,
    sameSite: 'lax',
    path: '/',
  })
  return response
}

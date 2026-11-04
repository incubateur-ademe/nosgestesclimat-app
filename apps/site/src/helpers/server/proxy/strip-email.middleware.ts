import { type NextRequest, NextResponse } from 'next/server'
import type { MiddlewareResult } from './types'

/** Brevo templates append the recipient address to their links. */
const EMAIL_PARAM = 'email'

/** Email middleware: drops that address with a redirect, so neither the page
 * nor the trackers reading `location.href` see it. */
export function middlewareStripEmail(request: NextRequest): MiddlewareResult {
  if (!request.nextUrl.searchParams.has(EMAIL_PARAM)) {
    return { redirect: null, cookies: [] }
  }

  const cleanUrl = request.nextUrl.clone()
  cleanUrl.searchParams.delete(EMAIL_PARAM)
  return { redirect: NextResponse.redirect(cleanUrl), cookies: [] }
}

import type { NextRequest, ProxyConfig } from 'next/server'
import { userMiddleware } from './helpers/server/dal/middleware'
import i18nMiddleware from './middlewares/i18nMiddleware'

export async function proxy(request: NextRequest) {
  return await userMiddleware(request, i18nMiddleware)
}

export const config: ProxyConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - images (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (manifest file)
     * - robots.txt (robots file)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|images|manifest.webmanifest|scripts|demos|misc|videos|robots.txt|datashare).*)',
    },
  ],
}

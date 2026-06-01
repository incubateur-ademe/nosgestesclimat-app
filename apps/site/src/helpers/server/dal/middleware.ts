import { getIronSession } from 'iron-session'
import type { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import {
  getGeolocation,
  supportedRegions,
  type UserRegion,
} from '../model/models'
import {
  type AnonSessionData,
  anonSessionOptions,
  getAnonSession,
} from './anonSession'
import { ANON_USER_ID_HEADER, CLIENT_USER_ID_HEADER } from './constants'

/**
 * Middleware that ensures an encrypted anonymous session cookie exists for
 * all routes. The session contains a `userId` (UUID) that identifies the anonymous user.
 *
 * Server actions must read the session directly via {@link getAnonSession}.
 */
export async function userMiddleware(
  request: NextRequest,
  next: (req: NextRequest) => NextResponse
) {
  const session = await getAnonSession()
  const searchParams = request.nextUrl.searchParams

  if (session.userId) {
    if (!session.region || !(session.region in supportedRegions)) {
      const region = await getGeolocation()
      session.region = region
      session.initialRegion = region
      await session.save()
    }
    if (searchParams.has('region')) {
      const region = searchParams.get('region')
      if (region && region in supportedRegions) {
        session.region = region as UserRegion
        await session.save()
      }
    }
    return next(request)
  }

  // When cookies are blocked (Safari iframe / WKWebView), the client
  // persists the userId via window.name and sends it as a header on
  // fetch requests (RSC navigations, server actions).
  const clientUserId = request.headers.get(CLIENT_USER_ID_HEADER)

  const userId = clientUserId ?? randomUUID()

  // We cannot set a session in the request object directly (like we would have done in any normal framework)
  // In that case, we need to pass this information thought the header.
  //
  // So the priority for getting the userId in the app is :
  // 1. Server session cookie (API)
  // 2. Anon session cookie
  // 3. x-ngc-user-id header (window.name fallback when cookies are blocked)
  // 4. x-anon-user-id header (fresh UUID on first visit)
  // This logic is mirrored in ./user.ts
  request.headers.set(ANON_USER_ID_HEADER, userId)

  const response = next(request)

  const newSession = await getIronSession<AnonSessionData>(
    request,
    response,
    anonSessionOptions
  )

  newSession.userId = userId
  newSession.region = session.region
  newSession.initialRegion = session.initialRegion

  await newSession.save()

  return response
}

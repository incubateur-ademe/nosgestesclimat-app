import { getIronSession } from 'iron-session'
import type { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import {
  getGeolocation,
  supportedRegions,
  type UserRegion,
} from '../model/models'
import { getRegionFromSearchParams } from './_helpers/getRegionFromParams'
import {
  type AnonSessionData,
  anonSessionOptions,
  getAnonSession,
} from './anonSession'
import { ANON_USER_ID_HEADER } from './constants'

async function resolveRegion(
  currentRegion: UserRegion | undefined,
  currentInitialRegion: UserRegion | undefined,
  searchParams: URLSearchParams
): Promise<{ region: UserRegion; initialRegion: UserRegion | undefined }> {
  let region: UserRegion | undefined = currentRegion
  let initialRegion: UserRegion | undefined = currentInitialRegion

  if (!region || !(region in supportedRegions)) {
    region = await getGeolocation()
    initialRegion = region
  }

  const forcedRegion = getRegionFromSearchParams(searchParams)
  if (forcedRegion) {
    region = forcedRegion
  }

  return { region, initialRegion }
}

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
    const { region, initialRegion } = await resolveRegion(
      session.region,
      session.initialRegion,
      searchParams
    )

    session.region = region
    session.initialRegion = initialRegion
    await session.save()

    return next(request)
  }

  const userId = randomUUID()

  // We cannot set a session in the request object directly (like we would have done in any normal framework)
  // In that case, we need to pass this information thought the header.
  //
  // So the priority for getting the userId in the app is :
  // 1. Server session cookie (API)
  // 2. Anon session cookie
  // 3. x-anon-user-id header, when no cookie is set (first visit)
  // This logic is mirrored in ./user.ts
  request.headers.set(ANON_USER_ID_HEADER, userId)

  const response = next(request)

  const newSession = await getIronSession<AnonSessionData>(
    request,
    response,
    anonSessionOptions
  )

  const { region, initialRegion } = await resolveRegion(
    session.region,
    session.initialRegion,
    searchParams
  )

  newSession.userId = userId
  newSession.region = region
  newSession.initialRegion = initialRegion

  await newSession.save()

  return response
}

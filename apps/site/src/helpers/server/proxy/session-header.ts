import { SESSION_COOKIE } from '@/helpers/server/cookie/auth.cookie'
import { isSessionExpired } from '@nosgestesclimat/core/features/auth/helpers/is-session-expired'
import { decryptSession } from '@nosgestesclimat/core/features/auth/services/decrypt-session.service'
import type { Session } from '@nosgestesclimat/core/features/auth/types/session'
import type { NextRequest } from 'next/server'

/**
 * `x-session` is what every server component and server action reads its user
 * from: derived from the session cookie, never from the request.
 */

/** What the session cookie of a request says, before anything is done with it. */
export type SessionRead =
  | { status: 'absent' }
  | { status: 'invalid'; error: unknown }
  | { status: 'valid'; payload: Session }
  | { status: 'expired'; payload: Session }

/**
 * Drops the `x-session` an incoming request carries, so that only a derived one
 * can be read downstream.
 */
export function clearSessionHeader(request: NextRequest) {
  request.headers.delete('x-session')
}

/**
 * Reads the session carried by the request cookie.
 *
 * An expired payload comes back as `expired` rather than dropped: the
 * interceptor needs it to rotate. No caller gets a payload without the status
 * that tells what it is worth.
 */
export async function readSession(request: NextRequest): Promise<SessionRead> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (!sessionCookie) {
    return { status: 'absent' }
  }

  try {
    const payload = await decryptSession(sessionCookie.value)

    return {
      status: isSessionExpired(payload) ? 'expired' : 'valid',
      payload,
    }
  } catch (err) {
    return { status: 'invalid', error: err }
  }
}

/** Writes the identity header for a session the caller has already checked. */
export function setSessionHeader(request: NextRequest, payload: Session) {
  request.headers.set(
    'x-session',
    JSON.stringify({ userId: payload.userId, email: payload.email })
  )
}

/**
 * Sets the identity header from the session cookie, and only while the session
 * is still valid.
 *
 * `proxy` calls this on Next's action-forward hop, which runs no interceptor.
 * Nothing else belongs on that hop: Next drops `set-cookie` on a forwarded
 * response, so anything consuming the session (rotation, migration) would spend
 * it without the browser ever receiving the replacement.
 */
export async function setSessionHeaderFromCookie(
  request: NextRequest
): Promise<void> {
  const session = await readSession(request)

  if (session.status === 'valid') {
    setSessionHeader(request, session.payload)
  }
}

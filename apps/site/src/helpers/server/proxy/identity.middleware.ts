import { identifyRequest } from '@/observability/request-identity'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import { type NextRequest } from 'next/server'

/** Reads the `x-session` header set by `middlewareAuth` and attributes the
 * request to its PostHog user/session. `distinctId` for verified users only
 * (unverified would open ghost profiles); `sessionId` always. */
export function middlewareIdentity(request: NextRequest): void {
  identifyRequest({
    distinctId: verifiedUserId(request),
    sessionId: request.headers.get('x-posthog-session-id') ?? undefined,
  })
}

/** The user id of a verified session, if the request carries one. */
function verifiedUserId(request: NextRequest): string | undefined {
  const raw = request.headers.get('x-session')

  if (!raw) {
    return undefined
  }

  let session: SessionPayload

  try {
    session = JSON.parse(raw) as SessionPayload
  } catch {
    // `middlewareAuth` wrote this header itself, so a corrupt value means no
    // verified user, not a crash.
    return undefined
  }

  // `email` marks a verified (logged-in) user — see `SessionPayload`.
  return session.email ? session.userId : undefined
}

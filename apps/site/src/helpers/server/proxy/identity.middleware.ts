import { identifyRequest } from '@/observability/request-identity'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import { type NextRequest } from 'next/server'

/**
 * Attributes the request to its PostHog user and session. Runs on the
 * `x-session` header `middlewareAuth` sets, so the session is already
 * decrypted here — this middleware only reads.
 *
 * A single call per request: `distinctId` for a verified user only. The
 * client calls `identify(userId)` on login, so the server id matches a
 * `distinct_id` PostHog knows; the server id of a visitor would open a ghost
 * profile instead. `sessionId` rides along whenever posthog-js sends it,
 * verified or not — PostHog links a person and a replay independently.
 */
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

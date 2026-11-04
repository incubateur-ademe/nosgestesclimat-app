import { identifyRequest } from '@/observability/request-identity'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import { type NextRequest } from 'next/server'

/** The PostHog session id nginx read from the visitor's cookie. */
function posthogSessionId(request: NextRequest): string | undefined {
  return request.headers.get('x-posthog-session-id') ?? undefined
}

/** Attributes the request to its PostHog session, the one recordings are
 * filed under. Called ahead of `middlewareAuth` so the interceptors' own logs
 * already carry the session id; `middlewareIdentity` later re-stamps the same
 * trace with the complete identity (the store entry is replaced, not merged). */
export function middlewarePosthogSession(request: NextRequest): void {
  identifyRequest({ sessionId: posthogSessionId(request) })
}

/** Attributes the request to its PostHog user and session: `distinctId` for
 * verified users only (unverified would open ghost profiles), plus the
 * `sessionId` again because the trace's identity is replaced, not merged.
 * Reads the `x-session` header set by `middlewareAuth`. */
export function middlewareIdentity(request: NextRequest): void {
  identifyRequest({
    distinctId: verifiedUserId(request),
    sessionId: posthogSessionId(request),
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

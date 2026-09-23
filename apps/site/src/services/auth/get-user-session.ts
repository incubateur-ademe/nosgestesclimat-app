'use server'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import type {
  AnonUser,
  AuthUser,
  UserSession,
} from '@nosgestesclimat/core/features/auth/types/user-session'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { cache } from 'react'

import logger from '@/logger.server'
import { identifyRequest } from '@/observability/request-identity'

/**
 * The session of the request being served, decrypted from its headers — and
 * the PostHog identity that comes with it. `cache` keeps one read per request:
 * the action, the page and the services below ask for it as many times as they
 * like.
 */
export const getUserSession = cache(
  async (): Promise<UserSession> =>
    await logger.withChildSpan('site.service.getUserSession', async () => {
      const reqHeaders = await headers()
      const sessionHeader = reqHeaders.get('x-session')

      if (!sessionHeader) {
        return null
      }

      let userId: string
      let email: string | null | undefined
      try {
        const parsed = JSON.parse(sessionHeader) as SessionPayload
        userId = parsed.userId
        email = parsed.email
      } catch {
        logger.warn('Malformed x-session header', {})
        return null
      }

      if (email) {
        const user: AuthUser = {
          id: userId,
          email,
          isAuth: true,
        }
        Sentry.setUser(user)
        identifyRequest({
          distinctId: user.id,
          sessionId: reqHeaders.get('x-posthog-session-id') ?? undefined,
        })
        return user
      }

      const user: AnonUser = {
        id: userId,
        isAuth: false,
      }
      Sentry.setUser(user)
      // A visitor has no server-side identity: the id posthog-js generated in
      // the browser is the only one PostHog knows, and the only one it can
      // match.
      identifyRequest({
        distinctId: reqHeaders.get('x-posthog-distinct-id') ?? undefined,
        sessionId: reqHeaders.get('x-posthog-session-id') ?? undefined,
      })
      return user
    })
)

'use server'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import type {
  AnonUser,
  AuthUser,
  UserSession,
} from '@nosgestesclimat/core/features/auth/types/user-session'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { cache } from 'react'

import logger from '@/logger/logger.server'

/**
 * The session of the request being served, decrypted from its headers. `cache`
 * keeps one read per request: the action, the page and the services below can
 * ask for it as many times as they like.
 */
export const getUserSession = cache(
  async (): Promise<UserSession> =>
    await logger.withSpan('site.action.getUserSession', async () => {
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
      } catch (error) {
        logger.error(toError(error))
        return null
      }

      if (email) {
        const user: AuthUser = {
          id: userId,
          email,
          isAuth: true,
        }
        // The PostHog link is the proxy's job (`middlewareIdentity`): this
        // service only resolves who the caller is.
        Sentry.setUser(user)
        return user
      }

      const user: AnonUser = {
        id: userId,
        isAuth: false,
      }
      Sentry.setUser(user)
      return user
    })
)

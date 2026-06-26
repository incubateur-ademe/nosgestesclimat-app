'use server'
import type { SessionPayload } from '@nosgestesclimat/core/features/auth/types/session'
import * as Sentry from '@sentry/nextjs'

import { headers } from 'next/headers'
import { cache } from 'react'

export interface AnonUser {
  id: string
  isAuth: false
}

export interface AuthUser {
  id: string
  email: string
  isAuth: true
}

/**
 * Represents a user that is either authenticated (has an email) or anonymous (has an id but no email).
 */
export type AppUser = AuthUser | AnonUser

/**
 * Represents the result of {@link getUserSession}:
 * - `AppUser`: A session exists (either anonymous or authenticated).
 * - `null`: No user session exists (e.g. first visit, no data at all).
 */
export type UserSession = AppUser | null

export const getUserSession = cache(async function (): Promise<UserSession> {
  const reqHeaders = await headers()
  const sessionHeader = reqHeaders.get('x-session')

  if (!sessionHeader) {
    return null
  }

  const { userId, email } = JSON.parse(sessionHeader) as SessionPayload

  if (email) {
    const user: AuthUser = {
      id: userId,
      email,
      isAuth: true,
    }
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

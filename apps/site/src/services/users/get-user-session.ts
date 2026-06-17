'use server'
import * as Sentry from '@sentry/nextjs'

import { NotImplementedError } from '@/helpers/server/error'
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
  name?: string
}

export type AppUser = AuthUser | AnonUser

export const getUserSession = cache(async function (): Promise<AppUser> {
  const reqHeaders = await headers()
  const sessionHeader = reqHeaders.get('x-session')

  if (!sessionHeader) {
    throw new NotImplementedError()
  }

  const { userId, email } = JSON.parse(sessionHeader)

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

'use server'
import * as Sentry from '@sentry/nextjs'

import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { InternalServerError } from '../error'
import { type AuthUser, getAuthUser } from '../model/user'
import { getAnonSession } from './anonSession'
import { DEFAULT_COOKIE_OPTION, SERVER_AUTH_COOKIE_NAME } from './authCookie'
import { ANON_USER_ID_HEADER } from './constants'

export interface AnonUser {
  id: string
  isAuth: false
}

export type AppUser = AuthUser | AnonUser

export const getUser = cache(async function (): Promise<AppUser> {
  try {
    const authUser = await getAuthUser()
    Sentry.setUser({
      authUser,
    })
    return authUser
  } catch {
    // Fallback to anonymous user.
    // 1. Try the session cookie first (set on previous visits).
    const session = await getAnonSession()
    if (session.userId) {
      const user = {
        id: session.userId,
        isAuth: false,
      } as const
      Sentry.setUser(user)
      return user
    }

    // 2. For brand-new users the Set-Cookie header has not been flushed yet
    //    when the Server Component renders, so the cookie is not readable via
    //    getAnonSession(). The middleware injects the freshly-generated userId
    //    as a trusted request header instead.
    const userId = (await headers()).get(ANON_USER_ID_HEADER)
    if (userId) {
      const user = {
        id: userId,
        isAuth: false,
      } as const
      Sentry.setUser(user)
      return user
    }

    throw new InternalServerError()
  }
})

export const logout = async () => {
  ;(await cookies()).delete({
    name: SERVER_AUTH_COOKIE_NAME,
    ...DEFAULT_COOKIE_OPTION,
  })

  const session = await getAnonSession()
  session.destroy()

  // The anonymous user ID cookie (ngc_anon_user) is NOT regenerated here.
  // The client-side resetLocalState() generates a new UUID in localStorage,
  // which is synced to the cookie automatically via migrateAnonSession.
}

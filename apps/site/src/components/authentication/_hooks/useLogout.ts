'use client'

import { STORAGE_KEY } from '@/constants/storage'
import { useUser } from '@/publicodes-state'
import { logout } from '@/services/auth/logout'
import { PostHog } from '@/services/tracking/Posthog'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useCallback } from 'react'

const posthog = new PostHog()

/** Drops the local user, ends the server session, then reloads the document. */
export function useLogout() {
  const { setUser, setSimulation } = useUser()

  return useCallback(async () => {
    // The simulation is server-owned: dropped rather than replaced, so the next
    // render resolves it from the server.
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify({}))
    setUser(null)
    setSimulation(undefined)
    posthog.resetIdentity()

    await logout()

    // A full-document navigation forces a request carrying the cleared cookies,
    // so the proxy serves a logged-out header.
    window.location.assign('/')
  }, [setUser, setSimulation])
}

import type { User } from '@/publicodes-state/types'
import { logout } from '@/services/auth/logout'
import { PostHog } from '@/services/tracking/Posthog'
import type { Simulation } from '../server/model/simulations'
import { resetLocalState } from './resetLocalState'

const posthog = new PostHog()

interface Props {
  setUser: (user: User | null) => void
  setSimulation: (simulation: Simulation | undefined) => void
}

export async function logoutAndResetUserState({
  setUser,
  setSimulation,
}: Props) {
  resetLocalState({ setUser, setSimulation })

  posthog.resetIdentity()

  try {
    await logout()
  } finally {
    // Server-action redirects become soft RSC navigations that can replay the per-session
    // prefetched App Shell (header still showing the logged-in user) from the
    // client Router Cache. A full-document navigation forces a real request with
    // the freshly-cleared cookies, so the proxy serves a logged-out header.
    window.location.assign('/')
  }
}

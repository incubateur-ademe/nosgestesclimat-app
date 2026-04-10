import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import type { GoogleTagCookieState } from './GoogleTagManager'
import type { PostHogCookieState } from './Posthog'

const COOKIE_STATE_KEY = 'cookie-management-state'

export interface CookieState {
  posthog: PostHogCookieState
  googleTag: GoogleTagCookieState
}

const DEFAULT_COOKIE_STATE: CookieState = {
  posthog: 'refused',
  googleTag: 'refused',
}

export let savedCookieState: CookieState
export let isCookieStateInitialized: boolean

try {
  const json = safeLocalStorage.getItem(COOKIE_STATE_KEY)
  if (!json) {
    throw new Error()
  }
  savedCookieState = JSON.parse(json) as CookieState
  isCookieStateInitialized = true
} catch {
  savedCookieState = DEFAULT_COOKIE_STATE
  isCookieStateInitialized = false
}
export function saveCookieState(state: CookieState) {
  savedCookieState = state
  safeLocalStorage.setItem(COOKIE_STATE_KEY, JSON.stringify(state))
}

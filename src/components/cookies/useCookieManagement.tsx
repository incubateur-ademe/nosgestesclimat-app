'use client'

import { captureCookieBannerStatus } from '@/constants/tracking/posthogTrackers'
import { GoogleTagManager } from '@/services/tracking/GoogleTagManager'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'
import {
  isCookieStateInitialized,
  saveCookieState,
  savedCookieState,
  type CookieState,
} from '../../services/tracking/cookieStateStore'
import { PostHog } from '../../services/tracking/Posthog'

type CookieBannerDisplayState = 'hidden' | 'banner' | 'form'

const posthog = new PostHog()
const googleTagManager = new GoogleTagManager()

const CookieConsentContext = createContext<{
  cookieBannerDisplayState: CookieBannerDisplayState
  setCookieBannerDisplayState: (state: CookieBannerDisplayState) => void
  cookieState: CookieState
  setCookieState: (state: CookieState) => void
}>({
  cookieBannerDisplayState: 'hidden',
  setCookieBannerDisplayState: () => {},
  cookieState: savedCookieState,
  setCookieState: () => {},
})

export const CookieConsentProvider = ({ children }: PropsWithChildren) => {
  const [cookieBannerDisplayState, setCookieBannerDisplayState] =
    useState<CookieBannerDisplayState>(
      isCookieStateInitialized ? 'hidden' : 'banner'
    )
  const [cookieState, setCookieState] = useState(savedCookieState)

  return (
    <CookieConsentContext
      value={{
        cookieBannerDisplayState,
        setCookieBannerDisplayState,
        cookieState,
        setCookieState,
      }}>
      {children}
    </CookieConsentContext>
  )
}

export function useCookieManagement(): {
  cookieState: CookieState
  onChange: (state: CookieState) => void
  cookieBannerDisplayState: CookieBannerDisplayState
  setCookieBannerDisplayState: (state: CookieBannerDisplayState) => void
  rejectAll: () => void
  acceptAll: () => void
} {
  const {
    cookieBannerDisplayState,
    setCookieBannerDisplayState,
    setCookieState,
    cookieState,
  } = useContext(CookieConsentContext)

  const onChange = (cookieState: CookieState) => {
    setCookieBannerDisplayState('hidden')
    setCookieState(cookieState)
    saveCookieState(cookieState)
    posthog.update(cookieState.posthog)
    googleTagManager.update(cookieState.googleTag)

    trackPosthogEvent(captureCookieBannerStatus({ cookieState }))
  }

  return {
    cookieState,
    cookieBannerDisplayState,
    setCookieBannerDisplayState,
    onChange,
    rejectAll: () => {
      onChange({
        posthog: 'refused',
        googleTag: 'refused',
      })
    },
    acceptAll: () => {
      onChange({
        posthog: 'accepted',
        googleTag: 'accepted',
      })
    },
  }
}

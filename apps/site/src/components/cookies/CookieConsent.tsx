'use client'

import { isCookieStateInitialized } from '../../services/tracking/cookieStateStore'
import CookieConsentBanner from './CookieConsentBanner'
import CookieConsentForm from './CookieConsentForm'
import { useCookieManagement } from './useCookieManagement'

export default function CookieConsent() {
  const {
    cookieState,
    onChange,
    cookieBannerDisplayState,
    setCookieBannerDisplayState,
    rejectAll,
    acceptAll,
  } = useCookieManagement()

  return (
    <>
      {cookieBannerDisplayState === 'banner' ? (
        <CookieConsentBanner
          onOpenForm={() => setCookieBannerDisplayState('form')}
          rejectAll={rejectAll}
          acceptAll={acceptAll}
        />
      ) : cookieBannerDisplayState === 'form' ? (
        <CookieConsentForm
          onCancel={() =>
            setCookieBannerDisplayState(
              isCookieStateInitialized ? 'hidden' : 'banner'
            )
          }
          rejectAll={rejectAll}
          acceptAll={acceptAll}
          defaultChoices={cookieState}
          confirmChoices={onChange}
        />
      ) : null}
    </>
  )
}

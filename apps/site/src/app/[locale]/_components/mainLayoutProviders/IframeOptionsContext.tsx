'use client'

import { verifyIfIntegratorBypassRights } from '@/helpers/iframe/verifyIntegratorBypassRights'
import { getIsFrenchRegion } from '@/helpers/regions/getIsFrenchRegion'
import { getIsIframe } from '@/utils/getIsIframe'
import * as Sentry from '@sentry/nextjs'
import { createContext, useEffect, useState } from 'react'

const STORAGE_KEYS = {
  IFRAME_SHARE_DATA: 'ngc-iframe-share-data',
  IFRAME_ONLY_SIMULATION: 'ngc-iframe-only-simulation',
  IFRAME_REGION: 'ngc-iframe-region',
  IFRAME_LANG: 'ngc-iframe-lang',
} as const

export const BODY_ID = 'ngc-body'

const getIsAllowedToBypassConsentDataShare = () => {
  if (typeof window === 'undefined') return false
  // https://stackoverflow.com/questions/6531534/document-location-parent-location-can-they-be-blocked

  const windowLocation = window.location
  const windowParentLocation = window.parent.location

  if (!windowLocation) {
    // eslint-disable-next-line no-console
    console.error('Iframe Nos Gestes Climat: window.location is undefined')
    Sentry.captureMessage(
      `Iframe Nos Gestes Climat: window.location is undefined`
    )
  }

  if (!windowParentLocation) {
    // eslint-disable-next-line no-console
    console.error(
      'Iframe Nos Gestes Climat: window.parent.location is undefined'
    )
    Sentry.captureMessage(
      `Iframe Nos Gestes Climat: window.parent.location is undefined`
    )
  }

  const integratorUrl = new URL(
    window.location != window.parent.location
      ? (document.referrer ?? 'about:blank')
      : (document.location.href ?? 'about:blank')
  ).origin

  return verifyIfIntegratorBypassRights(integratorUrl)
}

export const IframeOptionsContext = createContext<{
  isIframe?: boolean
  isIframeShareData?: boolean
  iframeRegion?: string | null
  isIframeOnlySimulation?: boolean
  isIntegratorAllowedToBypassConsentDataShare?: boolean
  iframeLang?: string | null
  isFrenchRegion?: boolean
}>({})

export const IframeOptionsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )

  // Detect iframe mode using window check
  const isIframe = getIsIframe()

  const [isIframeShareData, setIsIframeShareData] = useState(() => {
    if (!isIframe) return false
    return sessionStorage.getItem(STORAGE_KEYS.IFRAME_SHARE_DATA) === 'true'
  })
  const [isIframeOnlySimulation, setIsIframeOnlySimulation] = useState(() => {
    if (!isIframe) return false
    return (
      sessionStorage.getItem(STORAGE_KEYS.IFRAME_ONLY_SIMULATION) === 'true'
    )
  })
  const [iframeLang, setIframeLang] = useState<string | null>(() => {
    if (!isIframe) return null
    return sessionStorage.getItem(STORAGE_KEYS.IFRAME_LANG)
  })
  const [iframeRegion, setIframeRegion] = useState<string | null>(() => {
    if (!isIframe) return null
    return sessionStorage.getItem(STORAGE_KEYS.IFRAME_REGION)
  })

  useEffect(() => {
    if (!isIframe) return

    const urlShareData = Boolean(searchParams.get('shareData'))
    if (urlShareData) {
      setIsIframeShareData(true)
      sessionStorage.setItem(STORAGE_KEYS.IFRAME_SHARE_DATA, 'true')
    }

    const urlOnlySimulation = Boolean(searchParams.get('onlySimulation'))
    if (urlOnlySimulation) {
      setIsIframeOnlySimulation(true)
      sessionStorage.setItem(STORAGE_KEYS.IFRAME_ONLY_SIMULATION, 'true')
    }

    const urlRegion = searchParams.get('region')
    if (urlRegion) {
      setIframeRegion(urlRegion)
      sessionStorage.setItem(STORAGE_KEYS.IFRAME_REGION, urlRegion)
    }

    const urlLang = searchParams.get('lang')
    if (urlLang) {
      setIframeLang(urlLang)
      sessionStorage.setItem(STORAGE_KEYS.IFRAME_LANG, urlLang)
    }
  }, [isIframe]) // eslint-disable-line react-hooks/exhaustive-deps

  const isAllowedToBypassConsentDataShare =
    getIsAllowedToBypassConsentDataShare()

  // Add body classes for iframe styling
  useEffect(() => {
    if (isIframe) {
      document.body.classList.add('iframe-mode')
    }
  }, [isIframe])

  useEffect(() => {
    if (isIframeOnlySimulation) {
      document.body.classList.add('iframeOnlySimulation')
    }
  }, [isIframeOnlySimulation])

  const isFrenchRegion = getIsFrenchRegion({
    isIframe,
    iframeRegion: iframeRegion ?? 'FR',
  })

  return (
    <IframeOptionsContext.Provider
      value={{
        isIframeShareData: isIframe && isIframeShareData,
        iframeRegion,
        isIframe,
        isIframeOnlySimulation,
        isIntegratorAllowedToBypassConsentDataShare:
          isAllowedToBypassConsentDataShare,
        iframeLang,
        isFrenchRegion,
      }}>
      {children}
    </IframeOptionsContext.Provider>
  )
}

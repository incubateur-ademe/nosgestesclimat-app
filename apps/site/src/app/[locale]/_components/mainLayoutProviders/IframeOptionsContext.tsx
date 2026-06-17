'use client'

import { getIsFrenchRegion } from '@/helpers/regions/getIsFrenchRegion'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { getIsIframe } from '@/utils/getIsIframe'
import { createContext, useEffect, useState } from 'react'
import { getIsAllowedToBypassConsentDataShare } from './_helpers/getIsAllowedToBypassConsentDataShare'
import { useStoragePermissions } from './_hooks/useStoragePermissions'
import StorageAccessOverlay from './iframeOptionsContext/StorageAccessOverlay'

const STORAGE_KEYS = {
  IFRAME: 'ngc-iframe',
  IFRAME_SHARE_DATA: 'ngc-iframe-share-data',
  IFRAME_ONLY_SIMULATION: 'ngc-iframe-only-simulation',
  IFRAME_REGION: 'ngc-iframe-region',
  IFRAME_LANG: 'ngc-iframe-lang',
} as const

export const BODY_ID = 'ngc-body'

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
  const isIframe = getIsIframe(
    (searchParams.get('iframe') ||
      safeSessionStorage.getItem(STORAGE_KEYS.IFRAME)) === 'true'
  )

  // Special case : Safari doesn't handle cookies in iframes
  const { needPermission, askForPermission } = useStoragePermissions()

  // Initialized to false/null because during SSR getIsIframe() returns false
  // and the real values are only known after client-side hydration.
  const [isIframeShareData, setIsIframeShareData] = useState(false)
  const [isIframeOnlySimulation, setIsIframeOnlySimulation] = useState(false)
  const [iframeLang, setIframeLang] = useState<string | null>(null)
  const [iframeRegion, setIframeRegion] = useState<string | null>(null)

  // Read iframe parameters from URL params first, then fallback to sessionStorage.
  // URL params take priority; sessionStorage persists across navigations.
  useEffect(() => {
    if (!isIframe) return

    const urlShareData = searchParams.get('shareData') === 'true'
    const storedShareData =
      safeSessionStorage.getItem(STORAGE_KEYS.IFRAME_SHARE_DATA) === 'true'
    if (urlShareData || storedShareData) {
      setIsIframeShareData(true)
      if (urlShareData) {
        safeSessionStorage.setItem(STORAGE_KEYS.IFRAME_SHARE_DATA, 'true')
      }
    }

    const urlOnlySimulation = searchParams.get('onlySimulation') === 'true'
    const storedOnlySimulation =
      safeSessionStorage.getItem(STORAGE_KEYS.IFRAME_ONLY_SIMULATION) === 'true'
    if (urlOnlySimulation || storedOnlySimulation) {
      setIsIframeOnlySimulation(true)
      if (urlOnlySimulation) {
        safeSessionStorage.setItem(STORAGE_KEYS.IFRAME_ONLY_SIMULATION, 'true')
      }
    }

    const region = searchParams.get('region')
    const storedRegion = safeSessionStorage.getItem(STORAGE_KEYS.IFRAME_REGION)
    const resolvedRegion = region ?? storedRegion
    if (resolvedRegion) {
      setIframeRegion(resolvedRegion)
      if (region) {
        safeSessionStorage.setItem(STORAGE_KEYS.IFRAME_REGION, region)
      }
    }

    const lang = searchParams.get('lang')
    const storedLang = safeSessionStorage.getItem(STORAGE_KEYS.IFRAME_LANG)
    const resolvedLang = lang ?? storedLang
    if (resolvedLang) {
      setIframeLang(resolvedLang)
      if (lang) {
        safeSessionStorage.setItem(STORAGE_KEYS.IFRAME_LANG, lang)
      }
    }

    safeSessionStorage.setItem(STORAGE_KEYS.IFRAME, 'true')
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
      {isIframe && needPermission ? (
        <StorageAccessOverlay onAskPermission={askForPermission} />
      ) : (
        children
      )}
    </IframeOptionsContext.Provider>
  )
}

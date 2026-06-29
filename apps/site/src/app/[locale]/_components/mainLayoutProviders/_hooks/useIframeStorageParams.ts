'use client'

import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../iframeOptionsContext/storageKeys'

export const useIframeStorageParams = (isIframe: boolean) => {
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )

  const [isIframeShareData, setIsIframeShareData] = useState(false)
  const [isIframeOnlySimulation, setIsIframeOnlySimulation] = useState(false)
  const [iframeLang, setIframeLang] = useState<string | null>(null)
  const [iframeRegion, setIframeRegion] = useState<string | null>(null)

  // Read iframe parameters from URL params first, then fallback to sessionStorage.
  // URL params take priority; sessionStorage persists across navigations.
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  return {
    isIframeShareData,
    isIframeOnlySimulation,
    iframeLang,
    iframeRegion,
  }
}

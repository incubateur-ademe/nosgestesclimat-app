'use client'

import { getIsFrenchRegion } from '@/helpers/regions/getIsFrenchRegion'
import { getIsIframe } from '@/utils/getIsIframe'
import { createContext, useEffect } from 'react'
import { useBypassConsentDataShare } from './_hooks/useBypassConsentDataShare'
import { useIframeStorageParams } from './_hooks/useIframeStorageParams'
import { useStoragePermissions } from './_hooks/useStoragePermissions'
import StorageAccessOverlay from './iframeOptionsContext/StorageAccessOverlay'

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
  // Detect iframe mode using window check
  const isIframe = getIsIframe()

  // Special case : Safari doesn't handle cookies in iframes
  const { needPermission, askForPermission } = useStoragePermissions()

  const {
    isIframeShareData,
    isIframeOnlySimulation,
    iframeLang,
    iframeRegion,
  } = useIframeStorageParams(isIframe)

  const { isAllowedToBypassConsentDataShare } = useBypassConsentDataShare()

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

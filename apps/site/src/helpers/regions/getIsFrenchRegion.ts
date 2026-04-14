import { FRENCH_REGIONS } from '@/constants/model/frenchRegions'

export const getIsFrenchRegion = ({
  isIframe,
  iframeRegion,
}: {
  isIframe: boolean
  iframeRegion?: string | null
}) => {
  // Bypass if not inside an iframe
  if (!isIframe) return true

  return !iframeRegion ? true : FRENCH_REGIONS.has(iframeRegion)
}

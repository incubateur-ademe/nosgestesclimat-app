import { useIframe } from '../useIframe'

interface Props {
  hideIfNotFrenchRegion?: boolean
}

export function useShouldHideIfIframe({ hideIfNotFrenchRegion }: Props) {
  const { isIframeOnlySimulation, isFrenchRegion, isIframe } = useIframe()

  // Allows hiding not internationalized features (like the ones involving transactional e-mails)
  if (isIframe && hideIfNotFrenchRegion && !isFrenchRegion) return true

  if (isIframeOnlySimulation) return true

  return false
}

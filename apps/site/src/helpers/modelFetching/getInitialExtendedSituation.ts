import type { ExtendedSituation } from '@incubateur-ademe/nosgestesclimat'
import initialExtendedSituation from '@incubateur-ademe/nosgestesclimat/public/initialExtendedSituation.json'
/**
 * This function is used to get the initial extended situation. It can be called directly from a server component.
 */
export const getInitialExtendedSituation = (): ExtendedSituation => {
  // Fixme: shouldn't be necessary to explicitly cast this to ExtendedSituation
  // but the type is not correctly inferred from the JSON import.
  return initialExtendedSituation as ExtendedSituation
}

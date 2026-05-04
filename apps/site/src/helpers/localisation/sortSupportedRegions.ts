import type { Locale } from '@/i18nConfig'
import { supportedRegions } from '../server/model/models'

export const sortSupportedRegions = ({
  locale: locale,
}: {
  locale: Locale
}) => {
  return Object.fromEntries(
    Object.entries(supportedRegions).sort(
      (supportedRegionA, supportedRegionB) => {
        const nameA = supportedRegionA[1][locale].nom.toUpperCase() // ignore upper and lowercase

        const nameB = supportedRegionB[1][locale].nom.toUpperCase() // ignore upper and lowercase

        if (nameA < nameB) {
          return -1
        }

        if (nameA > nameB) {
          return 1
        }

        // names must be equal
        return 0
      }
    )
  )
}

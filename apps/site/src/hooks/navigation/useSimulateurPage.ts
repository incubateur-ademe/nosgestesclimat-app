import { END_PAGE_PATH } from '@/constants/urls/paths'
import {
  getLinkToSimulateur,
  getLinkToTutoriel,
} from '@/helpers/navigation/simulateurPages'
import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { useClientTranslation } from '../useClientTranslation'
import { useLocale } from '../useLocale'

interface GetLinkToSimulateurPageProps {
  newSimulation?: boolean
}
const getLinkToSimulateurPagePropsDefault = {
  newSimulation: false,
}
export function useSimulateurPage() {
  const searchParams = useSearchParams()

  const { t } = useClientTranslation()

  const locale = useLocale()

  const { tutorials } = useUser()

  const tutorielSeen = tutorials.testIntro

  const { progression } = useCurrentSimulation()

  const getLinkToSimulateurPage = useCallback(
    ({
      newSimulation,
    }: GetLinkToSimulateurPageProps = getLinkToSimulateurPagePropsDefault): string => {
      // If the user has completed the test (and we are not initializing a new one) we return the results page link
      if (progression === 1 && !newSimulation) {
        return END_PAGE_PATH
      }

      // If the user has seen the tutoriel we return the test page link
      if (tutorielSeen) {
        return getLinkToSimulateur({
          locale,
          searchParams,
        })
      }

      // else we return the tutoriel page link
      return getLinkToTutoriel({ locale, searchParams })
    },
    [progression, tutorielSeen, locale, searchParams]
  )

  const linkToSimulateurPageLabel = useMemo(() => {
    // If the user has completed the test we return the results page label
    if (progression === 1) {
      return t('Voir les résultats')
    }

    // If the user has seen the tutoriel we return the test page label
    if (progression > 0) {
      return t('Reprendre mon test')
    }

    // else we return the tutoriel page label
    return t('Commencer le test')
  }, [progression, t])

  return {
    getLinkToSimulateurPage,
    linkToSimulateurPageLabel,
  }
}

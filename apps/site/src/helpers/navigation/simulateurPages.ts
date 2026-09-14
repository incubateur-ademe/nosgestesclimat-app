import { SIMULATOR_PATH, TUTORIAL_PATH } from '@/constants/urls/paths'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question?: DottedName
  searchParams?: URLSearchParams
}

interface TutorielProps {
  searchParams?: URLSearchParams
}

/**
 * Get the link to the simulateur page with preserved search params.
 *
 * Volontairement sans préfixe de locale : l'URL canonique de la langue par
 * défaut (le français) est sans préfixe, et `next-i18n-router` redirige vers
 * `/en/…` uniquement pour les visiteurs anglophones. Préfixer ici faisait payer
 * un aller-retour de redirection à tous les francophones.
 */
export const getLinkToSimulateur = ({ question, searchParams }: Props = {}) => {
  const urlSearchParams = new URLSearchParams(searchParams?.toString() || '')

  if (question) {
    urlSearchParams.set(
      'question',
      question.replaceAll(' . ', '.').replaceAll(' ', '_')
    )
  }

  return `${SIMULATOR_PATH}${urlSearchParams.size > 0 ? `?${urlSearchParams.toString()}` : ''}`
}

/**
 * Get the link to the tutoriel page with preserved search params.
 * Sans préfixe de locale, pour la même raison que `getLinkToSimulateur`.
 */
export const getLinkToTutoriel = ({ searchParams }: TutorielProps = {}) => {
  if (searchParams) {
    return `${TUTORIAL_PATH}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`
  }

  return TUTORIAL_PATH
}

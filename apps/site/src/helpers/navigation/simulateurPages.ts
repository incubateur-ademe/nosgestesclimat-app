import { SIMULATOR_PATH } from '@/constants/urls/paths'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question?: DottedName
  locale?: string
  searchParams?: URLSearchParams
}

interface TutorielProps {
  locale?: string
  searchParams?: URLSearchParams
}

/**
 * Get the link to the simulateur page with preserved search params
 */
export const getLinkToSimulateur = ({
  question,
  locale,
  searchParams,
}: Props = {}) => {
  const basePath = locale ? `/${locale}` : ''
  const pathname = `${basePath}${SIMULATOR_PATH}`

  const urlSearchParams = new URLSearchParams(searchParams?.toString() || '')

  if (question) {
    urlSearchParams.set(
      'question',
      question.replaceAll(' . ', '.').replaceAll(' ', '_')
    )
  }

  return `${pathname}${urlSearchParams.size > 0 ? `?${urlSearchParams.toString()}` : ''}`
}

/**
 * Get the link to the tutoriel page with preserved search params
 */
export const getLinkToTutoriel = ({
  locale,
  searchParams,
}: TutorielProps = {}) => {
  const basePath = locale ? `/${locale}` : ''
  const pathname = `${basePath}/tutoriel`

  if (searchParams) {
    return `${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`
  }

  return pathname
}

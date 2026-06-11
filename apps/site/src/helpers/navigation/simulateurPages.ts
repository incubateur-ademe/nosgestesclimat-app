import { SIMULATOR_PATH } from '@/constants/urls/paths'
import i18nConfig from '@/i18nConfig'
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
 * Prefix path with the current locale unless it is the default locale
 */
export function getLocalizedPath(path: string, locale: string) {
  // Avoid prefixing non-local paths
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path
  }

  if (locale && locale !== i18nConfig.defaultLocale) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
  }
  return path
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

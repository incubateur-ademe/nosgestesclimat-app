import { noIndexObject } from '@/constants/metadata'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import type { Metadata } from 'next'

interface Props {
  locale: Locale
  title?: string
  description: string
  params?: Record<string, string>
  searchParams?: Record<string, string>
  image?: string
  robots?: {
    index: boolean
    follow: boolean
    nocache: boolean
    googleBot: {
      index: boolean
      follow: boolean
      noimageindex: boolean
      'max-video-preview': number
      'max-image-preview': 'none' | 'standard' | 'large'
      'max-snippet': number
    }
  }
  alternates?: {
    canonical: string
    /**
     * Per-locale relative path for each hreflang alternate to emit.
     * A locale absent from this map gets no hreflang tag.
     * Defaults to auto generation based on locales and canonical path
     */
    languages?: Partial<Record<Locale, string>>
  }
  locales?: Locale[]
}

/** Builds an `alternates.languages` map that points every given locale at the same relative path. */
export const buildLanguagesForLocales = (
  locales: Locale[],
  path: string
): Partial<Record<Locale, string>> =>
  Object.fromEntries(locales.map((locale) => [locale, path]))

const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://nosgestesclimat.fr'

const buildURL = ({
  params,
  searchParams,
  locale,
}: Pick<Props, 'params' | 'searchParams'> & { locale: Locale }) => {
  const paramsPart =
    params && Object.values(params).length > 0
      ? Object.values(params).map((value) => `/${value}`)
      : ''

  const searchParamsPart =
    searchParams && Object.values(searchParams).length > 0
      ? `?${Object.entries(searchParams).map(
          ([key, value], index) =>
            `${key}=${value}${
              index !== Object.values(searchParams).length - 1 ? '&' : ''
            }`
        )}`
      : ''

  return `${BASE_URL}${getLocalizedPath(locale, `${paramsPart}${searchParamsPart}`)}`
}

const buildAlternateUrl = (path: string, locale: Locale) =>
  `${BASE_URL}${getLocalizedPath(locale, path)}`

export function getMetadataObject({
  title,
  description,
  params,
  searchParams,
  image,
  alternates,
  locale,
  locales = i18nConfig.locales,
  ...props
}: Props): Metadata {
  const url = buildURL({
    params,
    searchParams,
    locale: locale ?? i18nConfig.defaultLocale,
  })

  const definitiveAlternates: {
    canonical?: string
    languages?: Record<string, string>
  } = {}

  if (alternates) {
    definitiveAlternates.canonical = buildAlternateUrl(
      alternates.canonical,
      locale
    )

    const languagesInput =
      alternates.languages ??
      buildLanguagesForLocales(locales, alternates.canonical)

    const builtLanguages = Object.fromEntries(
      Object.entries(languagesInput).map(([lang, path]) => [
        lang,
        buildAlternateUrl(path, lang as Locale),
      ])
    )

    definitiveAlternates.languages = {
      ...builtLanguages,
      'x-default': builtLanguages[i18nConfig.defaultLocale],
    }
  }

  return {
    title,
    description,
    metadataBase: new URL(url),
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image
        ? image
        : 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/metadata_1749c11cdc.png',
    },
    alternates: definitiveAlternates,
    ...props,
    ...(process.env.NEXT_PUBLIC_ENV !== 'production'
      ? { robots: noIndexObject }
      : {}),
  }
}

import { noIndexObject } from '@/constants/metadata'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'

interface Props {
  locale: string
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
      'max-image-preview': string
      'max-snippet': number
    }
  }
  alternates?: {
    canonical: string
  }
  locales?: Locale[]
}

const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://nosgestesclimat.fr'

const getLocalePrefix = (locale: string) =>
  locale === 'fr' ? '' : `/${locale}`

const buildURL = ({
  params,
  searchParams,
  locale,
}: Pick<Props, 'params' | 'searchParams'> & { locale: string }) => {
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

  return `${BASE_URL}${getLocalePrefix(locale)}${paramsPart}${searchParamsPart}`
}

const buildAlternateUrl = (path: string, locale: string) =>
  `${BASE_URL}${getLocalePrefix(locale)}${path}`

export function getMetadataObject({
  title,
  description,
  params,
  searchParams,
  image,
  alternates,
  locale,
  locales: localesProp,
  ...props
}: Props) {
  const url = buildURL({
    params,
    searchParams,
    locale: locale ?? i18nConfig.defaultLocale,
  })

  const locales = localesProp ?? i18nConfig.locales

  const definitiveAlternates: {
    canonical?: string
    languages?: Record<string, string>
  } = {}

  // Form canonical URL
  if (alternates) {
    definitiveAlternates.canonical = buildAlternateUrl(
      alternates.canonical,
      locale
    )

    // Only create hreflang if the page has an english version
    if (locales.length > 1) {
      // We set the alternates url for each language
      const languages: Record<string, string> = {}

      locales.map((locale) => {
        languages[locale] = buildAlternateUrl(alternates.canonical, locale)
      })

      // We return the alternates object with the canonical url and the languages alternates
      definitiveAlternates.languages = languages
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

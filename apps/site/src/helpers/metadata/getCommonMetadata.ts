import type { Locale } from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import { getServerTranslation } from '../getServerTranslation'
import { getMetadataObject } from './getMetadataObject'

export const getCommonMetadata = <T extends DefaultPageProps>({
  title,
  description,
  image,
  robots,
  alternates,
}: {
  title: string
  description?: string
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
  alternates?:
    | {
        canonical: string
        languages?: Partial<Record<Locale, string>>
      }
    | ((params: Awaited<DefaultPageProps<T>['params']>) => {
        canonical: string
        languages?: Partial<Record<Locale, string>>
      })
}) => {
  return async (props: DefaultPageProps<T>) => {
    const { params } = props
    const awaitedParams = await params
    const { locale } = awaitedParams

    const { t } = await getServerTranslation({ locale })

    const resolvedAlternates = alternates
      ? typeof alternates === 'function'
        ? alternates(awaitedParams)
        : alternates
      : undefined

    return getMetadataObject({
      locale,
      title: t(title),
      image,
      description: description
        ? t(description)
        : t(
            'Comprenez comment calculer votre empreinte sur le climat en 10min chrono.'
          ),
      ...(resolvedAlternates ? { alternates: resolvedAlternates } : {}),
      ...(robots ? { robots } : {}),
    })
  }
}

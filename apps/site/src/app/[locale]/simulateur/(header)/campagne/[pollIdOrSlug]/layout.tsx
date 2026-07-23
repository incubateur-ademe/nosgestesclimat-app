import { noIndexObject } from '@/constants/metadata'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata<
  DefaultPageProps<{ params: { pollIdOrSlug: string } }>
>({
  title: t('Tutoriel du calculateur - Nos Gestes Climat'),
  description: t(
    'Comprenez comment calculer votre empreinte sur le climat en 10min chrono.'
  ),
  alternates: ({ pollIdOrSlug }) => ({
    canonical: `/simulateur/campagne/${pollIdOrSlug}`,
  }),
  robots: noIndexObject,
})

export default function TutorielLayout({ children }: PropsWithChildren) {
  return children
}

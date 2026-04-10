import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { DefaultPageProps } from '@/types'

import type { PropsWithChildren } from 'react'
export async function generateMetadata({
  params,
}: DefaultPageProps<{
  params: Promise<{ orgaSlug: string; locale: string }>
}>) {
  const { orgaSlug, locale } = await params

  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t('Paramètres de mon organisation - Nos Gestes Climat'),
    description: t(
      'Accédez à des services sur mesure pour sensibiliser vos partenaires au sein de votre organisation.'
    ),
    alternates: {
      canonical: `/organisations/${orgaSlug}/parametres`,
    },
  })
}

export default function Layout({ children }: PropsWithChildren) {
  return <>{children}</>
}

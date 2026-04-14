import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { DefaultPageProps } from '@/types'
export async function generateMetadata({
  params,
}: DefaultPageProps<{
  params: Promise<{ orgaSlug: string; locale: string }>
}>) {
  const { orgaSlug, locale } = await params

  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t('Créer une campagne pour mon organisation - Nos Gestes Climat'),
    description: t(
      'Accédez à des services sur mesure pour sensibiliser vos partenaires au sein de votre organisation.'
    ),
    alternates: {
      canonical: `/organisations/${orgaSlug}/creer-campagne`,
    },
  })
}
/* global LayoutProps */
export default async function Layout({
  children,
}: LayoutProps<'/[locale]/organisations/[orgaSlug]/creer-campagne'>) {
  return children
}

import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Locale } from '@/i18nConfig'
import { EngineProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
export async function generateMetadata({
  params,
}: DefaultPageProps<{ params: { orgaSlug: string; pollSlug: string } }>) {
  const { orgaSlug, pollSlug, locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t('Résultats de mon test collectif - Nos Gestes Climat'),
    description: t(
      'Accédez à des services sur mesure pour sensibiliser vos partenaires au sein de votre organisation.'
    ),
    alternates: {
      canonical: `/organisations/${orgaSlug}/campagnes/${pollSlug}`,
    },
  })
}

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/organisations/[orgaSlug]/campagnes/[pollSlug]'>) {
  const locale = (await params).locale as Locale
  const rules = await getCachedRules({ locale })
  return <EngineProvider rules={rules}>{children}</EngineProvider>
}

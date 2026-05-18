import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Locale } from '@/i18nConfig'
import { EngineProvider } from '@/publicodes-state'

export const generateMetadata = getCommonMetadata({
  title: t('Mon groupe - Nos Gestes Climat'),
  description: t(
    "Calculez votre empreinte carbone en groupe et comparez la avec l'empreinte de vos proches grâce au calculateur de bilan carbone personnel Nos Gestes Climat."
  ),
  alternates: {
    canonical: '/amis/resultats',
  },
})

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/amis/resultats'>) {
  const locale = (await params).locale as Locale
  const rules = await getCachedRules({ locale })
  return <EngineProvider rules={rules}>{children}</EngineProvider>
}

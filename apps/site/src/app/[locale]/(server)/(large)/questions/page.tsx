import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Locale } from '@/i18nConfig'
import { EngineProvider } from '@/publicodes-state'
import Questions from './_components/Questions'

export const generateMetadata = getCommonMetadata({
  title: t('Liste des questions du calculateur - Nos Gestes Climat'),
  description: t(
    'Calculez votre empreinte sur le climat en 10 minutes chrono. Découvrez les gestes qui comptent vraiment pour le climat.'
  ),
  alternates: {
    canonical: '/questions',
  },
})

export default async function Page({
  params,
}: PageProps<'/[locale]/questions'>) {
  const locale = (await params).locale as Locale
  const rules = await getCachedRules({ locale, isOptim: false })
  return (
    <>
      <Title>
        <Trans locale={locale}>Questions</Trans>
      </Title>
      <EngineProvider rules={rules}>
        <Questions />
      </EngineProvider>
    </>
  )
}

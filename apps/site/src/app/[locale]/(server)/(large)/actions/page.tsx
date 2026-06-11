import ActionsPage from '@/components/actions/pages/ActionsPage'
import CTAButtons from '@/components/cta/CTAButtons'
import Trans from '@/components/translation/trans/TransServer'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUser } from '@/helpers/server/dal/user'
import { getPublicActionsCatalogue } from '@/services/actions/get-public-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { getFeatureFlag } from '@/services/feature-flags/getFeatureFlag'
import type { DefaultPageProps } from '@/types'
import { notFound } from 'next/navigation'

export const generateMetadata = getCommonMetadata({
  title: t('actions.publicListPage.metaTitle'),
  description: t('actions.publicListPage.metaDescription'),
  alternates: {
    canonical: '/actions',
  },
})

export default async function PublicActionsCatalogue({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    notFound()
  }

  const [actionsCatalogue, themes] = await Promise.all([
    getPublicActionsCatalogue(user.id),
    getThemes(),
  ])

  return (
    <ActionsPage
      title={
        <Trans locale={locale} i18nKey="actions.publicListPage.title">
          J'agis pour le climat, pas à pas
        </Trans>
      }
      description={
        <Trans locale={locale} i18nKey="actions.publicListPage.description">
          Choisissez les actions qui vous semblent atteignables et lancez-vous !
        </Trans>
      }
      cta={<CTAButtons locale={locale} withRestart />}
      topActions={actionsCatalogue.topActions}
      actions={actionsCatalogue.actions}
      themes={themes}
      locale={locale}
    />
  )
}

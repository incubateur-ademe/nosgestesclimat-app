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
          J’agis pour le climat
        </Trans>
      }
      description={
        <Trans locale={locale} i18nKey="actions.publicListPage.description">
          Retrouvez ci-dessous toutes les actions, individuelles ou collectives,
          qui comptent pour le climat. Pour le moment, elles sont génériques.
          Pour personnaliser ces recommandations d’actions (pertinence et calcul
          d’impact selon votre situation), il suffit de faire le test !
        </Trans>
      }
      cta={
        <>
          <h2 className="mb-0 text-2xl/normal font-medium">
            <Trans locale={locale} i18nKey="actions.publicListPage.cta.title">
              Connaissez-vous votre empreinte carbone ?
            </Trans>
          </h2>
          <p className="mb-8 text-base/normal">
            <Trans
              locale={locale}
              i18nKey="actions.publicListPage.cta.description">
              Passez le simulateur en 10 minutes et découvrez les actions
              personnalisées qui auront le plus d'impact sur votre empreinte.
            </Trans>
          </p>
          <div className="flex items-start">
            <CTAButtons locale={locale} withRestart />
          </div>
        </>
      }
      topActions={actionsCatalogue.topActions}
      actions={actionsCatalogue.actions}
      themes={themes}
      locale={locale}
    />
  )
}

import ActionsPage from '@/components/actions/pages/ActionsPage'
import CTAButtons from '@/components/cta/CTAButtons'
import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { START_SIMULATION_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getPublicActionsCatalogue } from '@/services/actions/get-public-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import type { DefaultPageProps } from '@/types'
import { cn } from 'cn'

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
  const [actionsCatalogue, themes] = await Promise.all([
    getPublicActionsCatalogue(locale),
    getThemes(locale),
  ])

  return (
    <>
      <ActionsPage
        title={
          <Trans i18nKey="actions.publicListPage.title">
            J’agis pour le climat
          </Trans>
        }
        description={
          <Trans i18nKey="actions.publicListPage.description">
            Retrouvez ci-dessous toutes les actions, individuelles ou
            collectives, qui comptent pour le climat. Pour personnaliser ces
            actions à votre situation, il suffit de{' '}
            <Link href={START_SIMULATION_PATH}>faire le test</Link>&nbsp;!
          </Trans>
        }
        cta={<CallToAction />}
        topActions={actionsCatalogue.topActions}
        actions={actionsCatalogue.actions}
        themes={themes}
        from="index"
        textOverrides={{
          highestImpactSectionDescription: (
            <Trans
              i18nKey="actions.components.highestImpactActionsSection.publicDescription">
              Le top 3 des actions qui permettent de limiter ou réduire ses
              émissions de CO<sub>2</sub>
            </Trans>
          ),
        }}
      />
      <CallToAction
        className="-mt-10 mb-20 border-slate-200 md:border-t md:border-b md:py-10"
      />
    </>
  )
}

type CallToActionProps = React.ComponentPropsWithoutRef<'aside'>

function CallToAction({ className, ...rest }: CallToActionProps) {
  return (
    <aside className={cn('mb-10', className)} {...rest}>
      <h2 className="mb-0 text-2xl/normal font-medium">
        <Trans i18nKey="actions.publicListPage.cta.title">
          Connaissez-vous votre empreinte carbone ?
        </Trans>
      </h2>
      <p className="mb-8 text-base/normal">
        <Trans i18nKey="actions.publicListPage.cta.description">
          Passez le simulateur en 10 minutes et découvrez les actions
          personnalisées qui auront le plus d'impact sur votre empreinte.
        </Trans>
      </p>
      <div className="flex items-start">
        <CTAButtons withRestart />
      </div>
    </aside>
  )
}

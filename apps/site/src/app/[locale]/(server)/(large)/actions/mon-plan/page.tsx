import { AUTHORIZED_FROM_SEARCH_PARAMS_VALUES } from '@/app/[locale]/(server)/(large)/(user-account)/(login)/_constants/search-params'
import ActionPlanLinks from '@/components/actions/ActionPlanLinks'
import { classesByTheme } from '@/components/actions/theme/constants/classesByTheme'
import NoResultsBlock from '@/components/dashboard/NoResultsBlock'
import PlusIcon from '@/components/icons/PlusIcon'
import UserSpaceTabs from '@/components/layout/UserSpaceTabs'
import Trans from '@/components/translation/trans/TransServer'
import {
  ACTIONS_MY_PLAN_PATH,
  ACTIONS_SUGGESTED_PATH,
  CONNEXION_PATH,
} from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getActionsPlan } from '@/services/actions/get-actions-plan'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import { cn } from 'cn'
import { redirect } from 'next/navigation'
import PlannedActionCard from './_components/PlannedActionCard'

export const generateMetadata = getCommonMetadata({
  title: t('Mon plan d’action - Nos Gestes Climat'),
  alternates: {
    canonical: ACTIONS_MY_PLAN_PATH,
  },
})

export default async function ActionsPlanPage({ params }: DefaultPageProps) {
  const { locale } = await params
  const user = await getUserSession()

  if (!user?.isAuth) {
    redirect(
      `${CONNEXION_PATH}?from=${AUTHORIZED_FROM_SEARCH_PARAMS_VALUES['build-action-plan']}`
    )
  }

  const actionsPlan = await getActionsPlan(locale)

  // No finished simulation: no plan to build.
  if (!actionsPlan) {
    return (
      <div className="flex flex-col pb-24">
        <UserSpaceTabs isAuth activeTabId="actions" />

        <ActionPlanLinks
          plan={{ numberOfCommittedActions: 0, totalImpact: 0 }}
          activeLink="plan"
          className="mb-8"
        />

        <NoResultsBlock />
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24">
      <UserSpaceTabs isAuth activeTabId="actions" />

      <ActionPlanLinks
        plan={actionsPlan.plan}
        activeLink="plan"
        className="mb-8"
      />

      {actionsPlan.plan.numberOfCommittedActions === 0 ? (
        <NoResultsBlock
          title={
            <Trans i18nKey="actions.myPlanPage.empty.title">
              Ajoutez des actions à votre sélection
            </Trans>
          }
          link={{
            href: ACTIONS_SUGGESTED_PATH,
            label: (
              <Trans i18nKey="actions.myPlanPage.empty.exploreActions">
                Explorer mes actions
              </Trans>
            ),
          }}
        />
      ) : (
        <div className="flex w-171 max-w-full flex-col gap-8">
          <div>
            <h1 className="mb-0 text-2xl/normal font-medium md:text-4xl/normal">
              <Trans i18nKey="actions.myPlanPage.title">
                Mon plan d’action
              </Trans>
            </h1>
            <p className="mb-0 text-base/normal">
              <Trans
                i18nKey="actions.myPlanPage.description"
                count={actionsPlan.plan.numberOfCommittedActions}
                defaultValue_one="Vous avez ajouté <1>{{count}} action</1> à votre plan.">
                Vous avez ajouté <strong>{'{{count}}'} actions</strong> à votre
                plan.
              </Trans>
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {actionsPlan.themes.map((theme) => (
              <section key={theme.id} className="flex flex-col gap-6">
                <h2
                  className={cn(
                    'mb-0 text-sm/normal font-bold uppercase',
                    classesByTheme[theme.key].header
                  )}>
                  {theme.title}
                </h2>

                <ul className="flex flex-col gap-2">
                  {theme.actions.map((action) => (
                    <li key={action.id}>
                      <PlannedActionCard action={action} locale={locale} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <ButtonLinkServer
            variant="outlined"
            className="w-full text-sm!"
            href={ACTIONS_SUGGESTED_PATH}>
            <PlusIcon className="stroke-primary-700 mr-2 size-3" />
            <Trans i18nKey="actions.myPlanPage.exploreOtherActions">
              Explorer d’autres actions
            </Trans>
          </ButtonLinkServer>
        </div>
      )}
    </div>
  )
}

import ActionsBlock from '@/components/results/ActionsBlock'
import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import CategoriesChart from '@/components/results/CategoriesChart'
import Trans from '@/components/translation/trans/TransServer'
import { carboneMetric } from '@/constants/model/metric'
import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { ComputedResults, Metric } from '@/publicodes-state/types'
import type { Group } from '@/types/groups'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { isGroupOwner } from '../../_helpers/isGroupOwner'
import GroupFootprintSelector from './groupResults/GroupFootprintSelector'
import GroupPointsFortsFaibles from './groupResults/GroupPointsFortsFaibles'
import InviteBlock from './groupResults/InviteBlock'
import OwnerAdminSection from './groupResults/OwnerAdminSection'
import ParticipantAdminSection from './groupResults/ParticipantAdminSection'
import Ranking from './groupResults/Ranking'

export default function GroupResults({
  locale,
  group,
  user,
  metric,
  rules,
  computedResults,
}: {
  locale: Locale
  group: Group
  user: AppUser
  metric: Metric
  rules: Partial<NGCRules>
  computedResults: ComputedResults
}) {
  const isOwner = isGroupOwner(group, user)

  const isCarbonFootprintSelected = metric === carboneMetric

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <h2 className="m-0 text-base font-bold md:text-lg">
          <Trans locale={locale}>Le classement</Trans>
        </h2>

        <GroupFootprintSelector metric={metric} />
      </div>

      <Ranking group={group} metric={metric} user={user} />

      <InviteBlock group={group} />

      {group?.participants?.length > 1 && isCarbonFootprintSelected && (
        <>
          <Separator />

          <GroupPointsFortsFaibles group={group} user={user} />
        </>
      )}

      <Separator />

      {
        // Hide this content when displaying the water footprint for now
        isCarbonFootprintSelected && (
          <>
            <h2 data-testid="votre-empreinte-title" className="mt-8">
              <Trans locale={locale}>Votre empreinte</Trans>
            </h2>

            <CategoriesChart />

            <CategoriesAccordion
              locale={locale}
              rules={rules}
              computedResults={computedResults}
              metric={metric}
            />

            <ActionsBlock locale={locale} className="my-6" />
          </>
        )
      }

      {isOwner ? (
        <OwnerAdminSection group={group} />
      ) : (
        <ParticipantAdminSection group={group} user={user} />
      )}
    </>
  )
}

'use client'

import FootprintSelector from '@/components/footprints/FootprintSelector'
import CategoriesChart from '@/components/results/CategoriesChart'
import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import Separator from '@/design-system/layout/Separator'
import { useGetGroupStats } from '@/hooks/groups/useGetGroupStats'
import type { Locale } from '@/i18nConfig'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import type { Group, Results } from '@/types/groups'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { isGroupOwner } from '../../_helpers/isGroupOwner'
import InviteBlock from './groupResults/InviteBlock'
import OwnerAdminSection from './groupResults/OwnerAdminSection'
import ParticipantAdminSection from './groupResults/ParticipantAdminSection'
import PointsFortsFaibles from './groupResults/PointsFortsFaibles'
import Ranking from './groupResults/Ranking'

export default function GroupResults({
  group,
  user,
  categoriesAccordion,
  actionsSection,
}: {
  locale: Locale
  group: Group
  user: AppUser
  categoriesAccordion?: ReactNode
  actionsSection?: ReactNode
}) {
  const isOwner = isGroupOwner(group, user)

  const [footprintSelected, setFootprintSelected] =
    useState<Metrics>(carboneMetric)

  const isCarbonFootprintSelected = footprintSelected === carboneMetric

  const results: Results = useGetGroupStats({
    groupMembers: group.participants,
    userId: user.id,
  })

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <h2 className="m-0 text-base font-bold md:text-lg">
          <Trans>Le classement</Trans>
        </h2>

        <FootprintSelector
          footprintSelected={footprintSelected}
          onChange={setFootprintSelected}
        />
      </div>

      <Ranking group={group} metric={footprintSelected} user={user} />

      <InviteBlock group={group} />

      {group?.participants?.length > 1 && isCarbonFootprintSelected && (
        <>
          <Separator />

          <PointsFortsFaibles
            pointsFaibles={results?.pointsFaibles}
            pointsForts={results?.pointsForts}
          />
        </>
      )}

      <Separator />

      {
        // Hide this content when displaying the water footprint for now
        isCarbonFootprintSelected && (
          <>
            <h2 data-testid="votre-empreinte-title" className="mt-8">
              <Trans>Votre empreinte</Trans>
            </h2>

            <CategoriesChart />

            {categoriesAccordion}

            {actionsSection}
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

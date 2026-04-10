'use client'

import HowToAct from '@/components/actions/HowToAct'
import FootprintSelector from '@/components/footprints/FootprintSelector'
import CategoriesAccordionLegacy from '@/components/results/CategoriesAccordionLegacy'
import CategoriesChart from '@/components/results/CategoriesChart'
import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import Separator from '@/design-system/layout/Separator'
import { useGetGroupStats } from '@/hooks/groups/useGetGroupStats'
import { useIsGroupOwner } from '@/hooks/groups/useIsGroupOwner'
import { useUser } from '@/publicodes-state'
import type { Group, Results } from '@/types/groups'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import type { QueryObserverResult } from '@tanstack/react-query'
import { useState } from 'react'
import InviteBlock from './groupResults/InviteBlock'
import OwnerAdminSection from './groupResults/OwnerAdminSection'
import ParticipantAdminSection from './groupResults/ParticipantAdminSection'
import PointsFortsFaibles from './groupResults/PointsFortsFaibles'
import Ranking from './groupResults/Ranking'

export default function GroupResults({
  group,
  refetchGroup,
}: {
  group: Group
  refetchGroup: () => Promise<QueryObserverResult<Group, Error>>
}) {
  const { user } = useUser()

  const { isGroupOwner } = useIsGroupOwner({ group })

  const [footprintSelected, setFootprintSelected] =
    useState<Metrics>(carboneMetric)

  const isCarbonFootprintSelected = footprintSelected === carboneMetric

  const results: Results = useGetGroupStats({
    groupMembers: group.participants,
    userId: user.userId,
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

      <Ranking
        group={group}
        refetchGroup={refetchGroup}
        metric={footprintSelected}
      />

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

            <CategoriesAccordionLegacy />

            <Separator className="my-6" />

            <HowToAct />

            <Separator className="my-6" />
          </>
        )
      }

      {isGroupOwner ? (
        <OwnerAdminSection group={group} />
      ) : (
        <ParticipantAdminSection group={group} />
      )}
    </>
  )
}

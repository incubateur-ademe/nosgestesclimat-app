'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import Trans from '@/components/translation/trans/TransClient'
import { organisationsDashboardClickFunFacts } from '@/constants/tracking/pages/organisationsDashboard'
import { captureClickFunFactsPlus } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import type { Entries } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName, FunFacts } from '@incubateur-ademe/nosgestesclimat'
import importedFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json'
import { utils } from 'publicodes'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import DetailedFunFacts from './funFacts/DetailedFunFacts'

const funFactsRules = importedFunFacts as { [k in keyof FunFacts]: DottedName }

const defaultFunFactsRules: { [k in keyof Partial<FunFacts>]: DottedName } = {
  percentageOfBicycleUsers: 'ui . organisations . transport . roule en vélo',
  percentageOfVegetarians: 'ui . organisations . alimentation . est végétarien',
  percentageOfCarOwners: 'ui . organisations . transport . roule en voiture',
}

const plusFunFactsRules: { [k in keyof Partial<FunFacts>]: DottedName } =
  Object.fromEntries(
    Object.entries(funFactsRules).filter(
      ([key]) => !(key in defaultFunFactsRules)
    )
  )

interface Props {
  funFacts?: FunFacts | null
  className?: string
}
export default function DetailedStatistics({ funFacts, className }: Props) {
  const [isSectionVisible, setIsSectionVisible] = useState(false)

  const funFactsByCategory = {} as Record<
    DottedName,
    [keyof Partial<FunFacts>, DottedName | undefined][]
  >

  const plusFunFactsRulesEntries = Object.entries(plusFunFactsRules) as Entries<
    typeof plusFunFactsRules
  >

  plusFunFactsRulesEntries.forEach((item) => {
    if (!item[1]) return
    const parent = utils.ruleParent(item[1]) as DottedName
    funFactsByCategory[parent] = [...(funFactsByCategory[parent] || []), item]
  })

  if (!funFacts) return null

  return (
    <div className={twMerge('flex flex-col', className)}>
      <Button
        className="my-4 w-auto self-center px-4! no-underline md:self-end"
        color="link"
        onClick={() => {
          trackMatomoEvent__deprecated(organisationsDashboardClickFunFacts)
          trackPosthogEvent(captureClickFunFactsPlus)
          setIsSectionVisible(!isSectionVisible)
        }}>
        <ChevronRight
          className={twMerge(
            'mr-2 rotate-90',
            isSectionVisible && '-rotate-90'
          )}
        />
        <span>
          {!isSectionVisible ? (
            <Trans>Voir plus</Trans>
          ) : (
            <Trans>Voir moins</Trans>
          )}
        </span>
      </Button>

      {isSectionVisible && (
        <DetailedFunFacts
          funFacts={funFacts}
          plusFunFactsRules={plusFunFactsRules}
        />
      )}
    </div>
  )
}

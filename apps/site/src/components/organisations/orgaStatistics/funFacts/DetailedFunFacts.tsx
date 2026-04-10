'use client'

import SaveIcon from '@/components/icons/SaveIcon'
import Trans from '@/components/translation/trans/TransClient'
import { organisationsDashboardClickFunFactsDownload } from '@/constants/tracking/pages/organisationsDashboard'
import { captureDownloadFunFactsPlus } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import type { Entries } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName, FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { toPng } from 'html-to-image'
import { useParams } from 'next/navigation'
import { utils } from 'publicodes'
import { useMemo } from 'react'
import FunFactsItem from './FunFactsItem'
import FunFactsPlusCategoryTitle from './FunFactsPlusCategoryTitle'

interface Props {
  plusFunFactsRules: { [k in keyof Partial<FunFacts>]: DottedName }
  funFacts: FunFacts
}

export default function DetailedFunFacts({
  plusFunFactsRules,
  funFacts,
}: Props) {
  const params = useParams()

  const funFactsByCategory = useMemo(() => {
    const localFunFactsByCategory = {} as Record<
      DottedName,
      [keyof Partial<FunFacts>, DottedName | undefined][]
    >

    const plusFunFactsRulesEntries = Object.entries(
      plusFunFactsRules
    ) as Entries<typeof plusFunFactsRules>

    plusFunFactsRulesEntries.forEach((item) => {
      if (!item[1]) return
      const parent = utils.ruleParent(item[1]) as DottedName
      localFunFactsByCategory[parent] = [
        ...(localFunFactsByCategory[parent] || []),
        item,
      ]
    })

    return localFunFactsByCategory
  }, [plusFunFactsRules])

  return (
    <div className="rounded-xl bg-gray-100">
      <div className="bg-gray-100 p-8 pb-16" id="funFactsPlus">
        <h2>Chiffres clés</h2>
        {(
          Object.entries(funFactsByCategory) as Entries<
            typeof funFactsByCategory
          >
        ).map(([category, funFactsEntries]) => (
          <div key={category} className="mt-12">
            <FunFactsPlusCategoryTitle category={category} />
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {funFactsEntries.map(([funFactKey, dottedName]) => (
                <FunFactsItem
                  key={funFactKey}
                  funFactKey={funFactKey}
                  dottedName={dottedName!}
                  funFacts={funFacts}
                  small={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 px-8">
        <Button
          size="sm"
          color="secondary"
          onClick={() => {
            trackMatomoEvent__deprecated(
              organisationsDashboardClickFunFactsDownload
            )
            trackPosthogEvent(captureDownloadFunFactsPlus)

            const funFactsPlus = document.getElementById('funFactsPlus')!

            toPng(funFactsPlus).then(function (dataUrl) {
              const link = document.createElement('a')
              link.download = `vos-chiffres-cles-${params.slug}.png`
              link.href = dataUrl
              link.click()
              link.remove()
            })
          }}>
          <SaveIcon className="fill-primary-700 mr-2 w-4" />

          <Trans>Télécharger l'image</Trans>
        </Button>
      </div>
    </div>
  )
}

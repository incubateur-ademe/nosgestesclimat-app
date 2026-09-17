'use client'

import HourglassIcon from '@/components/icons/HourglassIcon'
import Trans from '@/components/translation/trans/TransClient'
import Card from '@/design-system/layout/Card'
import type { PollAnonymityNotReached } from '@nosgestesclimat/core/features/polls/types/poll'

interface Props {
  isAdmin: boolean
  anonymity: PollAnonymityNotReached
}

export default function ResultsSoonBanner({ isAdmin, anonymity }: Props) {
  return (
    <div className="relative col-span-1">
      <div className="absolute top-0 left-0 z-10 h-full w-full p-10 pb-0">
        <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 bg-white opacity-50" />

        <Card className="w-full flex-row flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
          <div className="flex max-w-2xl gap-4">
            <HourglassIcon
              className="fill-primary-700"
              width="80"
              height="60"
            />
            <div className="flex items-center">
              {isAdmin ? (
                <p className="mb-0">
                  <span>
                    <Trans>
                      Partagez le test pour obtenir vos premiers résultats.
                    </Trans>
                  </span>
                  <span>
                    {' ('}
                    <Trans
                      i18nKey="pollResults.anonymityNotice"
                      defaults="Données consultables à partir de {{minParticipants}} participants, dans un souci d'anonymat."
                      values={{ minParticipants: anonymity.minParticipants }}
                    />
                    {')'}
                  </span>
                </p>
              ) : (
                <p className="mb-0">
                  <Trans
                    i18nKey="pollResults.anonymityNotice"
                    defaults="Données consultables à partir de {{minParticipants}} participants, dans un souci d'anonymat."
                    values={{ minParticipants: anonymity.minParticipants }}
                  />
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-rainbow-rotation overflow-hidden rounded-xl bg-gray-100 p-8">
        <p className="text-primary-700 text-4xl font-bold">
          8,0 <span className="text-base font-normal">t CO₂e</span>
        </p>
        <p className="text-xl">
          <Trans>Empreinte moyenne</Trans>
        </p>
      </div>
    </div>
  )
}

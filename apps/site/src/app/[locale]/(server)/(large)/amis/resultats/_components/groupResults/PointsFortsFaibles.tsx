'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { PointsFortsFaiblesType } from '@/types/groups'
import PointsListItem from './pointsFortsFaibles/PointsListItem'

export default function PointsFortsFaibles({
  pointsForts,
  pointsFaibles,
}: {
  pointsForts: PointsFortsFaiblesType[]
  pointsFaibles: PointsFortsFaiblesType[]
}) {
  return (
    <div>
      {!!pointsForts && pointsForts.length > 0 && (
        <>
          <h2 className="mt-0 text-lg" data-testid="points-fort-faibles-title">
            <Trans>Vos points forts</Trans>
          </h2>
          <p className="mb-4 text-gray-500">
            <Trans>Par rapport à la moyenne du groupe.</Trans>
          </p>
          <ul className="pl-0">
            {pointsForts?.map((point, index) => {
              const { name, value, difference } = point.resultObject

              return (
                <PointsListItem
                  name={name}
                  value={value}
                  difference={difference || 0}
                  key={`points-forts-${index}`}
                />
              )
            })}
          </ul>
        </>
      )}

      {!!pointsFaibles && pointsFaibles.length > 0 && (
        <>
          <h2 className="mt-6 text-lg">
            <Trans>Vos points faibles</Trans>
          </h2>
          <ul className="pl-0">
            {pointsFaibles?.map((point, index) => {
              const { name, value, difference } = point.resultObject
              return (
                <PointsListItem
                  name={name}
                  value={value}
                  difference={difference || 0}
                  key={`points-faibles-${index}`}
                />
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

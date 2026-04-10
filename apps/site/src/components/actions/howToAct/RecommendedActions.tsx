'use client'

import { useActions, useEngine } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'
import RecommendedAction from './recommendedActions/RecommendedAction'

export default function RecommendedActions() {
  const { orderedActions: orderedActionDottedNames } = useActions()
  const { getCategory } = useEngine()

  const filteredSameCategoriesActionDottedNames = useMemo(
    () =>
      orderedActionDottedNames
        .reduce(
          (accumulator: DottedName[], currentActionDottedName: DottedName) => {
            // We don't want to display the "services sociétaux" category
            if (currentActionDottedName.includes('services sociétaux')) {
              return accumulator
            }

            return accumulator.find((actionDottedName) => {
              return (
                getCategory(actionDottedName) ===
                getCategory(currentActionDottedName)
              )
            })
              ? accumulator
              : [...accumulator, currentActionDottedName]
          },
          []
        )
        .slice(0, 3),
    [orderedActionDottedNames, getCategory]
  )

  return (
    <div className="max-w-screen overflow-auto">
      <ul className="flex flex-row gap-4">
        {filteredSameCategoriesActionDottedNames.map(
          (actionDottedName, index) => (
            <RecommendedAction
              actionDottedName={actionDottedName}
              key={`recommended-actionDottedName-${index}`}
            />
          )
        )}
      </ul>
    </div>
  )
}

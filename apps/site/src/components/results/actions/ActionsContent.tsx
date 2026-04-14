'use client'

import CategoryTabs from '@/components/filtering/CategoryTabs'
import { FILTER_SEARCH_PARAM_KEY } from '@/constants/filtering'
import getActions from '@/helpers/actions/getActions'
import {
  useCurrentSimulation,
  useEngine,
  useTempEngine,
} from '@/publicodes-state'
import { capitalizeString } from '@/utils/capitalizeString'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Actions from './actionsContent/Actions'
import OptionBar from './actionsContent/OptionBar'

export default function ActionsContent() {
  const { getCategory, safeEvaluate } = useEngine()
  const containerRef = useRef<HTMLDivElement>(null)

  const [radical, setRadical] = useState(true)

  const searchParams = useSearchParams()

  const category = decodeURIComponent(
    searchParams.get(FILTER_SEARCH_PARAM_KEY) ?? ''
  )

  const { actionChoices, progression } = useCurrentSimulation()

  const { rules, getSpecialRuleObject } = useTempEngine()

  const { categories } = useEngine()

  const actions = getActions({
    rules,
    radical,
    safeEvaluate,
    getSpecialRuleObject,
    actionChoices,
  })

  const actionsFilteredCategorically = actions.filter((action) =>
    category ? getCategory(action.dottedName) === category : true
  )

  const isSimulationWellStarted = progression > 0.5

  // Manage tab navigation for all focusable elements
  useEffect(() => {
    if (!containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach((el) => {
      if (isSimulationWellStarted) {
        // If simulation is started, remove tabIndex=-1 if we added it
        if (el.getAttribute('data-original-tab-index') !== null) {
          const originalValue = el.getAttribute('data-original-tab-index')
          if (originalValue) {
            el.setAttribute('tabindex', originalValue)
          } else {
            el.removeAttribute('tabindex')
          }
          el.removeAttribute('data-original-tab-index')
        }
      } else {
        // If simulation is not started, save original tabIndex and set to -1
        if (el.getAttribute('data-original-tab-index') === null) {
          const currentTabIndex = el.getAttribute('tabindex')
          if (currentTabIndex !== null) {
            el.setAttribute('data-original-tab-index', currentTabIndex)
          } else {
            el.setAttribute('data-original-tab-index', '')
          }
          el.setAttribute('tabindex', '-1')
        }
      }
    })
  }, [isSimulationWellStarted])

  return (
    <div
      ref={containerRef}
      className={`${
        isSimulationWellStarted ? '' : 'pointer-events-none opacity-90'
      } relative text-center`}
      aria-hidden={isSimulationWellStarted ? false : true}>
      <OptionBar
        setRadical={setRadical}
        radical={radical}
        actions={actionsFilteredCategorically}
      />

      <CategoryTabs
        categories={categories.map((category) => ({
          title: capitalizeString(category) ?? '',
          dottedName: category,
          count: actions.filter(
            (action) =>
              action.dottedName.startsWith(category) && action.nodeValue !== 0
          ).length,
        }))}>
        <Actions
          actions={actionsFilteredCategorically}
          rules={rules ?? {}}
          radical={radical}
          key={`update-key-${category}-${Object.keys(actionChoices).length}`}
        />
      </CategoryTabs>
    </div>
  )
}

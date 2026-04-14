import { carboneMetric, metrics } from '@/constants/model/metric'
import { useCurrentSimulation } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import type { ComputedResults, Metric } from '@/publicodes-state/types'
import { areArraysEqual } from '@/utils/areArraysEqual'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode, PublicodesExpression } from 'publicodes'
import { useCallback, useEffect, useMemo, useRef } from 'react'

interface Props {
  categories: DottedName[]
  subcategories: DottedName[]
  everyQuestions: DottedName[]
  everyMosaicChildrenWithParent: Record<DottedName, DottedName[]>
  isEngineInitialized: boolean
  safeEvaluate?: (
    rule: PublicodesExpression,
    metric?: Metric
  ) => EvaluatedNode | null
  safeGetRule: (rule: DottedName) => NGCRuleNode | undefined
}
export function useInitializeSimulationWithEngine({
  categories,
  subcategories,
  everyQuestions,
  everyMosaicChildrenWithParent,
  safeEvaluate,
  isEngineInitialized,
}: Props) {
  const { situation, foldedSteps, updateCurrentSimulation } =
    useCurrentSimulation()

  // Check all foldedSteps. If a foldedstep is a mosaic child, we remove it from the foldedSteps but in the same time we add its parent to the foldedSteps if it is not already present

  const filteredFoldedSteps = useMemo(() => {
    let newFoldedSteps = [...foldedSteps]

    foldedSteps.forEach((foldedStep) => {
      // Check if the foldedStep is a question
      if (!everyQuestions.includes(foldedStep)) return
      // Check if the foldedStep is a mosaic child
      const parentMosaic = Object.entries(everyMosaicChildrenWithParent).find(
        ([, children]) => children.includes(foldedStep)
      )?.[0] as DottedName | undefined

      if (parentMosaic) {
        // Remove the foldedStep from the foldedSteps
        newFoldedSteps = newFoldedSteps.filter(
          (step) => step !== foldedStep && step !== parentMosaic
        )
        // Add the parent to the foldedSteps if it is not already present
        if (!newFoldedSteps.includes(parentMosaic)) {
          newFoldedSteps.push(parentMosaic)
        }
      }
    })

    return newFoldedSteps
  }, [everyMosaicChildrenWithParent, everyQuestions, foldedSteps])

  useEffect(() => {
    if (areArraysEqual(foldedSteps, filteredFoldedSteps)) return

    updateCurrentSimulation({ foldedSteps: filteredFoldedSteps })
  }, [filteredFoldedSteps, foldedSteps, updateCurrentSimulation])

  // little helper function to get the numeric value of a dottedName (it is a copy of the one in useEngine)
  const getNumericValue = useCallback(
    (dottedName: DottedName, metric?: Metric): number => {
      // If the engine is not initialized, we return 0
      if (!isEngineInitialized) return 0

      const nodeValue = safeEvaluate?.(dottedName, metric)?.nodeValue
      return Number(nodeValue) === nodeValue ? nodeValue : 0
    },
    [safeEvaluate, isEngineInitialized]
  )

  // Set the computed results object (after engine init only)
  const computedResults: ComputedResults = useMemo(
    () =>
      getComputedResults({
        metrics,
        categories,
        subcategories,
        getNumericValue,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, getNumericValue, situation, subcategories]
  )

  // Update the simulation with the computed results (only if the computed results have changed)
  const prevComputedResults = useRef<ComputedResults>(computedResults)
  useEffect(() => {
    if (prevComputedResults.current === computedResults) return

    updateCurrentSimulation({ computedResults })

    prevComputedResults.current = computedResults
  }, [computedResults, updateCurrentSimulation])

  const isInitialized = useMemo(
    () => computedResults[carboneMetric].bilan !== 0,
    [computedResults]
  )

  return { isInitialized }
}

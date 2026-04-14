import getNamespace from '@/publicodes-state/helpers/getNamespace'
import getSomme from '@/publicodes-state/helpers/getSomme'
import { EngineContext } from '@/publicodes-state/providers/engineProvider/context'
import type { Metric } from '@/publicodes-state/types'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useContext } from 'react'

/**
 * A hook that make available some information on the current instanciated simulation.
 */
export default function useEngine() {
  const {
    rules,
    engine,
    pristineEngine,
    safeGetRule,
    safeEvaluate,
    parsedRules,
    everyRules,
    everyInactiveRules,
    everyQuestions,
    everyNotifications,
    everyUiCategories,
    everyMosaicChildrenWithParent,
    rawMissingVariables,
    categories,
    subcategories,
    addToEngineSituation,
    isInitialized,
  } = useContext(EngineContext)

  const getValue = (dottedName: DottedName): NodeValue =>
    safeEvaluate(dottedName)?.nodeValue

  const getNumericValue = useCallback(
    (dottedName: DottedName, metric?: Metric): number => {
      const nodeValue = safeEvaluate(dottedName, metric)?.nodeValue
      return Number(nodeValue) === nodeValue ? nodeValue : 0
    },
    [safeEvaluate]
  )

  const getCategory = (dottedName: DottedName): DottedName =>
    getNamespace(dottedName, 1) ?? ('' as DottedName)

  const checkIfValid = (dottedName: DottedName): boolean =>
    safeGetRule(dottedName) ? true : false

  const getSubcategories = useCallback(
    (dottedName: DottedName) =>
      (getSomme(safeGetRule(dottedName)?.rawNode) || []).map(
        (subCategory) =>
          `${dottedName as string} . ${subCategory as string}` as DottedName
      ),
    [safeGetRule]
  )

  return {
    rules,
    engine,
    pristineEngine,
    safeGetRule,
    safeEvaluate,
    parsedRules,
    everyRules,
    everyInactiveRules,
    everyQuestions,
    everyNotifications,
    everyUiCategories,
    everyMosaicChildrenWithParent,
    rawMissingVariables,
    categories,
    subcategories,
    addToEngineSituation,
    isInitialized,
    getValue,
    getNumericValue,
    getCategory,
    checkIfValid,
    getSubcategories,
  }
}

import { carboneMetric } from '@/constants/model/metric'
import { useEngine } from '@/publicodes-state'
import getSomme from '@/publicodes-state/helpers/getSomme'
import { safeGetRuleHelper } from '@/publicodes-state/helpers/safeGetRuleHelper'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { PublicodesExpression } from 'publicodes'
import Engine from 'publicodes'
import { useCallback, useMemo } from 'react'
import { safeEvaluateHelper } from '../../helpers/safeEvaluateHelper'
import type { Metric, Situation } from '../../types'

interface Props {
  rules?: Partial<NGCRules>
  situation: Situation
}
/**
 * A hook that set up a separate engine to use for calculation.
 *
 * Very ressource intensive. Use with caution
 */
export default function useDisposableEngine({ rules, situation }: Props) {
  const { rules: contextRules } = useEngine()

  const engine = useMemo(() => {
    return new Engine<DottedName>(rules ?? contextRules, {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      logger: { warn: () => {}, error: () => {}, log: () => {} },
      strict: {
        situation: false,
        noOrphanRule: false,
      },
    }).setSituation(situation)
  }, [contextRules, rules, situation])

  const safeEvaluate = useCallback(
    (expr: PublicodesExpression, metric: Metric = carboneMetric) => {
      const exprWithContext = {
        valeur: expr,
        contexte: {
          métrique: `'${metric}'`,
        },
      }

      return safeEvaluateHelper(exprWithContext, engine ?? new Engine())
    },
    [engine]
  )

  const safeGetRule = useMemo(
    () =>
      (rule: DottedName, engineUsed = engine) =>
        safeGetRuleHelper(rule, engineUsed),
    [engine]
  )

  const getValue = (dottedName: DottedName) =>
    safeEvaluate(dottedName)?.nodeValue

  const updateSituation = (
    newSituation: Situation,
    keepPreviousSituation = true
  ) => {
    engine.setSituation(newSituation, { keepPreviousSituation })
  }

  const getSubcategories = useCallback(
    (dottedName: DottedName) =>
      (getSomme(safeGetRule(dottedName)?.rawNode) || []).map(
        (subCategory) =>
          `${dottedName} . ${subCategory}` as unknown as DottedName
      ),
    [safeGetRule]
  )

  return {
    engine,
    getValue,
    updateSituation,
    safeEvaluate,
    safeGetRule,
    getSubcategories,
  }
}

/* eslint-disable no-console */

import { carboneMetric } from '@/constants/model/metric'
import { safeEvaluateHelper } from '@/publicodes-state/helpers/safeEvaluateHelper'
import { safeGetRuleHelper } from '@/publicodes-state/helpers/safeGetRuleHelper'
import type { Metric, SafeEvaluate } from '@/publicodes-state/types'
import type {
  DottedName,
  NGCRuleNode,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import { captureException } from '@sentry/nextjs'
import type { PublicodesExpression } from 'publicodes'
import Engine from 'publicodes'
import { useCallback, useMemo } from 'react'

/**
 * Initiate the engine based on the rules we pass
 *
 * Also return safeEvaluate and safeGetRule wich catch errors if dottedName is invalid
 *
 * And a pristine engine wich can be used to assess rules without any situation (for exemple, we can reliably sort the subcategories this way)
 */
export function useEngine(rules?: Partial<NGCRules>) {
  const engine = useMemo(() => {
    if (!rules) return undefined

    const nbRules = Object.keys(rules).length
    console.time(`⚙️ Parsing ${nbRules}`)
    const engine = new Engine<DottedName>(rules, {
      logger: {
        log(msg: string) {
          console.log(`[publicodes:log] ${msg}`)
        },
        warn(msg) {
          console.warn(`[publicodes:warn] ${msg}`)
        },
        error(msg: string) {
          console.error(`[publicodes:error] ${msg}`)

          // If it's a situation error, we throw it to sentry
          if (/[ Erreur lors de la mise à jour de la situation ]/.exec(msg)) {
            captureException(new Error(msg))
          }
        },
      },
      // This flag doesn't work with `checkPossibleValues` strict mode for us as we set some default values to non applicable rules.
      // Even ignoring strict mode, it still raises a "Maximum call stack size exceeded" error difficult to investigate.
      // flag: {
      //   filterNotApplicablePossibilities: true,
      // },
      strict: {
        situation: false,
        noOrphanRule: false,
        checkPossibleValues: false,
        // TODO: deal with cycle runtime (model side)
        noCycleRuntime: false,
      },
      warn: {
        cyclicReferences: false,
        situationIssues: false,
      },
    })
    console.timeEnd(`⚙️ Parsing ${nbRules}`)
    return engine
  }, [rules])

  const pristineEngine = useMemo(() => engine?.shallowCopy(), [engine])

  const safeEvaluate = useCallback(
    (expr: PublicodesExpression, metric: Metric = carboneMetric) => {
      // Somehow, for the case for `textile . empreinte`, the evaluation was not working. Defining the context only for "non default" metric ("eau"). Still, it seems that there is a bug... Maybe due to some delay somewhere.
      const exprWithContext =
        metric === carboneMetric
          ? expr
          : {
              valeur: expr,
              contexte: {
                métrique: `'${metric}'`,
              },
            }

      return safeEvaluateHelper(exprWithContext, engine ?? new Engine())
    },
    [engine]
  ) as SafeEvaluate

  const safeGetRule = useMemo<
    (ruleName: DottedName) => NGCRuleNode | undefined
  >(
    () => (ruleName: DottedName) =>
      safeGetRuleHelper(ruleName, engine ?? new Engine()) ?? undefined,
    [engine]
  )

  return {
    engine,
    pristineEngine,
    safeEvaluate,
    safeGetRule,
  }
}

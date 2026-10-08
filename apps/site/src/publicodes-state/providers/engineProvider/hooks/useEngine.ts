/* eslint-disable no-console */

import { carboneMetric } from '@/constants/model/metric'
import _logger from '@/logger/logger.browser'
import { safeEvaluateHelper } from '@/publicodes-state/helpers/safeEvaluateHelper'
import { safeGetRuleHelper } from '@/publicodes-state/helpers/safeGetRuleHelper'
import type { Metric, SafeEvaluate, Situation } from '@/publicodes-state/types'
import { isServerSide } from '@/utils/nextjs/isServerSide'
import type {
  DottedName,
  NGCRuleNode,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import type { PublicodesExpression } from 'publicodes'
import Engine from 'publicodes'
import { useCallback, useMemo } from 'react'

const logger = _logger.child({ scope: 'site.engine.useEngine' })

/** Builds the publicodes engine from rules + situation. Also exposes
 * `safeEvaluate`/`safeGetRule` (catch invalid dotted names) and a pristine
 * engine for rule inspection without a situation. */
export function useEngine(
  rules: Partial<NGCRules>,
  initialSituation: Situation
) {
  const engine = useMemo(() => {
    if (isServerSide()) {
      return undefined
    }
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

          // A situation that cannot be updated is a diagnostic about the rules,
          // not a failure: PostHog Logs reads its rate, where Sentry would
          // capture it without a stack.
          if (/[ Erreur lors de la mise à jour de la situation ]/.exec(msg)) {
            logger.warn(msg)
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
    engine.setSituation(initialSituation)
    return engine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules])

  const pristineEngine = useMemo(
    () => (engine ? engine.shallowCopy().setSituation({}) : undefined),
    [engine]
  )

  const safeEvaluate = useCallback(
    (expr: PublicodesExpression, metric: Metric = carboneMetric) => {
      if (!engine) {
        return null
      }
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

      return safeEvaluateHelper(exprWithContext, engine)
    },
    [engine]
  ) as SafeEvaluate

  const safeGetRule = useMemo<
    (ruleName: DottedName) => NGCRuleNode | undefined
  >(
    () => (ruleName: DottedName) =>
      engine ? (safeGetRuleHelper(ruleName, engine) ?? undefined) : undefined,
    [engine]
  )

  return {
    engine,
    pristineEngine,
    safeEvaluate,
    safeGetRule,
  }
}

import type Engine from 'publicodes'
import { toError } from '../../../lib/to-error.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { ActionAssessmentPublicodesError } from '../../actions/errors/action-assessment.error.ts'
import {
  buildRuleIdToDottedName,
  evaluateAction,
  toNewActionAssessment,
} from '../../actions/helpers/action-assessment.ts'
import { createActionAssessments } from '../../actions/repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../../actions/repositories/actions.repository.ts'
import type { NewActionAssessment } from '../../actions/types/action.ts'
import type { Logger } from '../../logger/index.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'
import { evaluatePublicRule } from '../../rules/helpers/public-rules.ts'
import { createRuleEvaluations } from '../../rules/repositories/rule-evaluations.repository.ts'
import type {
  EngineEvaluation,
  NewRuleEvaluation,
  Rule,
} from '../../rules/types/rule.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/** The simulation an evaluation is made for, its model serialized. */
export interface SimulationToEvaluate {
  id: string
  model: ModelString
}

/**
 * Produces and persists everything derived from a simulation's situation: its
 * action assessments and the evaluations of its model's public rules.
 *
 * The engine's situation must already be set to the simulation's.
 * `publicRules` are the model's stored public rules, resolved beforehand by
 * `resolvePublicRules`. Everything is evaluated before anything is written,
 * and every write goes through `session`, so the caller commits them together
 * with the job's status, or rolls them all back.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulation: SimulationToEvaluate,
    { session, publicRules }: { session: Transaction; publicRules: Rule[] }
  ): Promise<void> {
    const logger = deps.logger.child({
      scope: 'core.service.evaluateSimulation',
      simulationId: simulation.id,
      model: simulation.model,
    })

    const actions = await findActionRuleIds({ session })

    const assessments = assessActions({
      engine,
      simulationId: simulation.id,
      actions,
      logger,
    })
    const ruleEvaluations = evaluatePublicRules({
      engine,
      simulationId: simulation.id,
      publicRules,
      logger,
    })

    if (assessments.length > 0) {
      await createActionAssessments(assessments, { session })
    }
    if (ruleEvaluations.length > 0) {
      await createRuleEvaluations(ruleEvaluations, { session })
    }
  }
}
export type EvaluateSimulation = ReturnType<typeof createEvaluateSimulation>

const assessActions = ({
  engine,
  simulationId,
  actions,
  logger,
}: {
  engine: Engine
  simulationId: string
  actions: { id: string; ruleId: string }[]
  logger: Logger
}): NewActionAssessment[] => {
  if (actions.length === 0) {
    throw new ActionAssessmentPublicodesError({
      message: 'No actions found in database. Cannot assess actions.',
    })
  }

  const ruleIdToDottedName = buildRuleIdToDottedName(engine)

  if (ruleIdToDottedName.size === 0) {
    throw new ActionAssessmentPublicodesError({
      message:
        'No publicodes rules have meta.id, cannot link actions to dotted names. ' +
        'Ensure the model includes meta.id on action rules.',
    })
  }

  return actions.flatMap(({ id, ruleId }) => {
    const dottedName = ruleIdToDottedName.get(ruleId)
    if (!dottedName) {
      logger.warn('No rule found with this id', { actionId: id, ruleId })
      return []
    }

    // The action is skipped, never retried: the failure is captured, so a
    // rule the engine chokes on does not vanish with its assessment.
    const applicability = evaluateOrSkip(
      () => evaluateAction({ engine, dottedName }),
      {
        logger,
        thrownLevel: 'error',
        meta: { actionId: id, ruleId, dottedName },
      }
    )
    return applicability === undefined
      ? []
      : [toNewActionAssessment({ simulationId, actionId: id }, applicability)]
  })
}

const evaluatePublicRules = ({
  engine,
  simulationId,
  publicRules,
  logger,
}: {
  engine: Engine
  simulationId: string
  publicRules: Rule[]
  logger: Logger
}): NewRuleEvaluation[] =>
  publicRules.flatMap(({ id, name, metric }) => {
    // A skipped rule never fails the simulation: its other evaluations are
    // stored, and the model's mistake is found in the logs.
    const applicability = evaluateOrSkip(
      () => evaluatePublicRule({ engine, name, metric }),
      { logger, thrownLevel: 'warn', meta: { dottedName: name, metric } }
    )
    return applicability === undefined
      ? []
      : [{ simulationId, ruleId: id, ...applicability }]
  })

/**
 * Runs one evaluation and returns what it maps to, or `undefined` when it
 * throws or yields a value that cannot be stored. Either case is logged with
 * `meta`; an unexpected value is detected, not thrown, so it is only a warning.
 */
const evaluateOrSkip = <Applicability>(
  evaluate: () => EngineEvaluation<Applicability>,
  {
    logger,
    thrownLevel,
    meta,
  }: {
    logger: Logger
    thrownLevel: 'warn' | 'error'
    meta: Record<string, unknown>
  }
): Applicability | undefined => {
  let evaluation: EngineEvaluation<Applicability>
  try {
    evaluation = evaluate()
  } catch (error) {
    logger[thrownLevel](toError(error), meta)
    return undefined
  }

  if (evaluation.outcome === 'unexpected_node_value') {
    logger.warn(`Unexpected nodeValue: ${evaluation.nodeValue}`, meta)
    return undefined
  }

  return evaluation.applicability
}

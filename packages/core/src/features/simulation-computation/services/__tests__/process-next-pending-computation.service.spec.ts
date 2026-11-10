import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { failure, success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import {
  createActionAssessments,
  findActionAssessmentsBySimulation,
} from '../../../actions/repositories/action-assessments.repository.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../../../models/errors.ts'
import { serializeModel } from '../../../models/helpers/model-versions.ts'
import { upsertRules } from '../../../models/repositories/rules.repository.ts'
import type { Rule } from '../../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../../../simulations/errors/simulations.error.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { createRuleEvaluations } from '../../../simulations/repository/rule-evaluations.repository.ts'
import { SimulationComputationFailedError } from '../../errors/simulation-computation.error.ts'
import { createTestEngine } from '../../factories/engine.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import {
  createProcessNextPendingComputation,
  isReportedComputationFailure,
  type AssessActions,
  type EvaluateSimulation,
  type ResolvePublicRules,
} from '../process-next-pending-computation.service.ts'

const assessActions = vi.fn<AssessActions>()
const evaluateSimulation = vi.fn<EvaluateSimulation>()
const resolvePublicRules = vi.fn<ResolvePublicRules>()
const logger = createTestLogger()

const processNextPendingComputation = createProcessNextPendingComputation({
  assessActions,
  evaluateSimulation,
  resolvePublicRules,
  logger,
})

/**
 * Stands for any write `assessActions` makes through its session. The action
 * is created beforehand: PGlite has a single connection, so a query outside
 * the open transaction would hang.
 */
const fakeActionsAssessing = async (): Promise<AssessActions> => {
  const action = await actionFactory.published().create()
  return (_engine, simulationId, { session }) =>
    createActionAssessments(
      [{ simulationId, actionId: action.id, applicable: true, impact: 1 }],
      { session }
    )
}

describe('processNextPendingComputation', () => {
  const engine = createTestEngine({})
  const getEngine = () => engine

  beforeEach(() => {
    assessActions.mockResolvedValue(undefined)
    evaluateSimulation.mockResolvedValue(success())
    resolvePublicRules.mockResolvedValue([])
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    assessActions.mockReset()
    evaluateSimulation.mockReset()
    resolvePublicRules.mockReset()
    await emptyDatabase(prisma)
  })

  it('returns success(false) when no job is pending', async () => {
    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(false))
    expect(assessActions).not.toHaveBeenCalled()
    expect(evaluateSimulation).not.toHaveBeenCalled()
  })

  it('evaluates the claimed simulation in its situation, commits the writes and marks its job completed', async () => {
    const situatedEngine = createTestEngine({
      transport: null,
      'transport . voiture': null,
      'transport . voiture . km': { question: 'Combien ?', unité: 'km' },
    })
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .params({ situation: { 'transport . voiture . km': 12000 } })
      .create()

    assessActions.mockImplementation(await fakeActionsAssessing())
    let evaluatedKm: unknown
    evaluateSimulation.mockImplementation((evaluatedEngine) => {
      evaluatedKm = evaluatedEngine.evaluate(
        'transport . voiture . km'
      ).nodeValue
      return Promise.resolve(success())
    })

    const result = await processNextPendingComputation(() => situatedEngine)

    expect(result).toEqual(success(true))
    expect(assessActions).toHaveBeenCalledExactlyOnceWith(
      situatedEngine,
      simulation.id,
      { session: expect.anything() }
    )
    expect(evaluateSimulation).toHaveBeenCalledExactlyOnceWith(
      situatedEngine,
      simulation.id,
      [],
      { session: expect.anything() }
    )
    expect(evaluatedKm).toBe(12000)

    expect(await findActionAssessmentsBySimulation(simulation.id)).toHaveLength(
      1
    )
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('rolls the writes back and marks the job failed when the evaluation throws', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()

    assessActions.mockImplementation(await fakeActionsAssessing())
    evaluateSimulation.mockRejectedValue(new Error('Engine evaluation failed'))

    const result = await processNextPendingComputation(getEngine)

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected processNextPendingComputation to fail')
    }
    expect(result.error).toBeInstanceOf(SimulationComputationFailedError)
    // The worker logs the failure with the simulation and its model.
    expect(result.error).toMatchObject({
      simulationId: simulation.id,
      model: serializeModel(simulation.model),
    })
    expect(isReportedComputationFailure(result.error)).toBe(false)
    expect(logger.error).not.toHaveBeenCalled()

    expect(await findActionAssessmentsBySimulation(simulation.id)).toHaveLength(
      0
    )
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })

  // The stored evaluations of a computed simulation are complete for its
  // model: the job fails rather than completing without some of them.
  it('rolls the writes back, marks the job failed and fails with the public rules that cannot be evaluated', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()

    assessActions.mockImplementation(await fakeActionsAssessing())
    const evaluationError = new PublicRulesEvaluationError([
      new UnexpectedNodeValueError({
        dottedName: 'footprint . true',
        metric: 'carbon',
        nodeValue: 'boolean',
      }),
    ])
    evaluateSimulation.mockResolvedValue(failure(evaluationError))

    const result = await processNextPendingComputation(getEngine)

    // The cause names the rules.
    expect(result).toEqual(
      failure(expect.any(SimulationComputationFailedError))
    )
    expect(result).toMatchObject({
      error: {
        simulationId: simulation.id,
        model: serializeModel(simulation.model),
        cause: evaluationError,
      },
    })

    expect(await findActionAssessmentsBySimulation(simulation.id)).toHaveLength(
      0
    )
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })

  // Only this service knows the job a rule failed: it reports each rule, and
  // the worker does not report the failure a second time.
  it('reports each public rule that cannot be evaluated with its job', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()
    const unexpected = new UnexpectedNodeValueError({
      dottedName: 'footprint . true',
      metric: 'carbon',
      nodeValue: 'boolean',
    })
    const threw = new RuleEvaluationThrewError({
      dottedName: 'footprint . missing',
      metric: 'water',
      cause: new Error('Rule not found'),
    })
    evaluateSimulation.mockResolvedValue(
      failure(new PublicRulesEvaluationError([unexpected, threw]))
    )

    const result = await processNextPendingComputation(getEngine)

    expect(logger.child).toHaveBeenCalledWith({
      scope: 'core.service.processNextPendingComputation',
      simulationId: simulation.id,
      model: serializeModel(simulation.model),
    })
    // The error carries what names the rule: its fields become the line's
    // attributes, its `code` the `error.type`, its `cause` a chained exception.
    expect(logger.error).toHaveBeenCalledTimes(2)
    expect(logger.error).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        code: 'unexpected_node_value',
        dottedName: 'footprint . true',
        metric: 'carbon',
        nodeValue: 'boolean',
      })
    )
    expect(logger.error).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        code: 'rule_evaluation_threw',
        dottedName: 'footprint . missing',
        metric: 'water',
        cause: new Error('Rule not found'),
      })
    )
    if (result.success) {
      throw new Error('Expected processNextPendingComputation to fail')
    }
    expect(isReportedComputationFailure(result.error)).toBe(true)
  })

  it('reprocesses a reclaimed stale job without a duplicate-key failure', async () => {
    const simulation = await simulationFactory
      .completed()
      .withStaleProcessingComputation()
      .create()

    assessActions.mockImplementation(await fakeActionsAssessing())

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))
    expect(await findActionAssessmentsBySimulation(simulation.id)).toHaveLength(
      1
    )
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  describe('with public rules', () => {
    it('evaluates the simulation with the public rules resolved for its model', async () => {
      const simulation = await simulationFactory
        .completed()
        .withPendingComputation()
        .create()
      const publicRules: Rule[] = [
        { id: 1, name: 'footprint . transport', metric: 'carbon' },
        { id: 2, name: 'footprint . transport', metric: 'water' },
      ]
      resolvePublicRules.mockResolvedValue(publicRules)

      await processNextPendingComputation(getEngine)

      expect(resolvePublicRules).toHaveBeenCalledExactlyOnceWith(
        engine,
        simulation.model
      )
      expect(evaluateSimulation).toHaveBeenCalledExactlyOnceWith(
        engine,
        simulation.id,
        publicRules,
        { session: expect.anything() }
      )
    })

    // The rules are resolved once per model and cached: had they been stored
    // within a rolled back job, the next jobs of the model would reference
    // rules that do not exist.
    it('keeps the rules resolved for a failed job usable by the next ones', async () => {
      await Promise.all(
        [1, 2].map(() =>
          simulationFactory.completed().withPendingComputation().create()
        )
      )

      // Stands for the resolver: it stores the rules on its first call, with
      // no session, and caches them for the next ones.
      let resolvedRules: Rule[] | undefined
      resolvePublicRules.mockImplementation(async () => {
        resolvedRules ??= await upsertRules([
          {
            name: 'footprint . transport',
            metric: 'carbon',
            title: null,
            description: null,
          },
        ])
        return resolvedRules
      })
      evaluateSimulation
        .mockRejectedValueOnce(new Error('Engine evaluation failed'))
        .mockImplementationOnce(
          async (_engine, simulationId, publicRules, { session }) => {
            await createRuleEvaluations(
              publicRules.map((rule) => ({
                simulationId,
                ruleId: rule.id,
                applicable: true,
                value: 1,
              })),
              { session }
            )
            return success()
          }
        )

      const failed = await processNextPendingComputation(getEngine)
      // Its evaluations reference the rules resolved for the failed job: the
      // job would fail had they been rolled back.
      const processed = await processNextPendingComputation(getEngine)

      expect(failed.success).toBe(false)
      expect(processed).toEqual(success(true))
    })
  })

  // `setSituation` resets the cache too: only a reset after the evaluation
  // drops what it cached.
  describe('resets the engine cache once evaluated', () => {
    it('after a processed job', async () => {
      await simulationFactory.completed().withPendingComputation().create()
      const resetCache = vi.spyOn(engine, 'resetCache')

      await processNextPendingComputation(getEngine)

      expect(resetCache.mock.invocationCallOrder.at(-1)).toBeGreaterThan(
        evaluateSimulation.mock.invocationCallOrder[0]
      )
    })

    it('after a failed job', async () => {
      await simulationFactory.completed().withPendingComputation().create()
      evaluateSimulation.mockRejectedValue(
        new Error('Engine evaluation failed')
      )
      const resetCache = vi.spyOn(engine, 'resetCache')

      await processNextPendingComputation(getEngine)

      expect(resetCache.mock.invocationCallOrder.at(-1)).toBeGreaterThan(
        evaluateSimulation.mock.invocationCallOrder[0]
      )
    })
  })
})

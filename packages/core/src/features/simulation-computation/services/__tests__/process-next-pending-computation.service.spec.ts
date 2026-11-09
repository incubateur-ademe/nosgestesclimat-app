import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import { createActionAssessments } from '../../../actions/repositories/action-assessments.repository.ts'
import { serializeModel } from '../../../models/helpers/model-versions.ts'
import { createResolvePublicRules } from '../../../models/services/resolve-public-rules.service.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { createRuleEvaluations } from '../../../simulations/repository/rule-evaluations.repository.ts'
import { SimulationComputationFailedError } from '../../errors/simulation-computation.error.ts'
import { createTestEngine } from '../../factories/engine.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import {
  createProcessNextPendingComputation,
  type AssessActions,
  type EvaluateSimulation,
} from '../process-next-pending-computation.service.ts'

const assessActions = vi.fn<AssessActions>()
const evaluateSimulation = vi.fn<EvaluateSimulation>()

let processNextPendingComputation: ReturnType<
  typeof createProcessNextPendingComputation
>

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

const findActionAssessments = (simulationId: string) =>
  prisma.actionAssessment.findMany({ where: { simulationId } })

describe('processNextPendingComputation', () => {
  const engine = createTestEngine({})
  const getEngine = () => engine

  beforeEach(() => {
    assessActions.mockResolvedValue(undefined)
    evaluateSimulation.mockResolvedValue(undefined)
    // A fresh resolver per test: its cache would outlive the emptied database.
    processNextPendingComputation = createProcessNextPendingComputation({
      assessActions,
      evaluateSimulation,
      resolvePublicRules: createResolvePublicRules(),
    })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    assessActions.mockReset()
    evaluateSimulation.mockReset()
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
      return Promise.resolve()
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

    expect(await findActionAssessments(simulation.id)).toHaveLength(1)
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

    expect(await findActionAssessments(simulation.id)).toHaveLength(0)
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })

  it('reprocesses a reclaimed stale job without a duplicate-key failure', async () => {
    const simulation = await simulationFactory
      .completed()
      .withStaleProcessingComputation()
      .create()

    assessActions.mockImplementation(await fakeActionsAssessing())

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))
    expect(await findActionAssessments(simulation.id)).toHaveLength(1)
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  describe('with public rules', () => {
    const publicRulesEngine = createTestEngine({
      métrique: {
        avec: { carbone: null, eau: null },
        'une possibilité': ['carbone', 'eau'],
        'par défaut': "'carbone'",
      },
      'footprint . transport': { public: 'oui', valeur: 1 },
    })

    const simulationsOfOneModel = () =>
      Promise.all(
        [1, 2].map(() =>
          simulationFactory
            .completed()
            .withModelRegion('FR')
            .withModelVersion({ publishedTag: '1.0.0' })
            .withPendingComputation()
            .create()
        )
      )

    it("evaluates the simulation with its model's public rules", async () => {
      await simulationFactory.completed().withPendingComputation().create()

      await processNextPendingComputation(() => publicRulesEngine)

      expect(evaluateSimulation).toHaveBeenCalledExactlyOnceWith(
        publicRulesEngine,
        expect.any(String),
        [
          {
            id: expect.any(Number),
            name: 'footprint . transport',
            metric: 'carbon',
          },
          {
            id: expect.any(Number),
            name: 'footprint . transport',
            metric: 'water',
          },
        ],
        { session: expect.anything() }
      )
    })

    // The rules are resolved once per model and cached: had they been stored
    // within a rolled back job, the next jobs of the model would reference
    // rules that do not exist.
    it('keeps the rules resolved for a failed job usable by the next ones', async () => {
      await simulationsOfOneModel()

      evaluateSimulation
        .mockRejectedValueOnce(new Error('Engine evaluation failed'))
        .mockImplementationOnce(
          (_engine, simulationId, publicRules, { session }) =>
            createRuleEvaluations(
              publicRules.map((rule) => ({
                simulationId,
                ruleId: rule.id,
                applicable: true,
                value: 1,
              })),
              { session }
            )
        )

      const failed = await processNextPendingComputation(
        () => publicRulesEngine
      )
      const processed = await processNextPendingComputation(
        () => publicRulesEngine
      )

      expect(failed.success).toBe(false)
      expect(processed).toEqual(success(true))
      // One evaluation per metric of the model's single public rule.
      expect(await prisma.ruleEvaluation.count()).toBe(2)
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

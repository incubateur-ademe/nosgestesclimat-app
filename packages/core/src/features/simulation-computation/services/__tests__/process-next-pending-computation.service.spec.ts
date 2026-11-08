import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import { createActionAssessments } from '../../../actions/repositories/action-assessments.repository.ts'
import { serializeModel } from '../../../models/helpers/model-versions.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import type { EvaluateSimulation } from '../../../simulations/services/evaluate-simulation.service.ts'
import { SimulationComputationFailedError } from '../../errors/simulation-computation.error.ts'
import { createTestEngine } from '../../factories/engine.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import { createProcessNextPendingComputation } from '../process-next-pending-computation.service.ts'

const evaluateSimulation = vi.fn<EvaluateSimulation>()

const processNextPendingComputation = createProcessNextPendingComputation({
  evaluateSimulation,
})

/**
 * Stands for any write `evaluateSimulation` makes through its session. The
 * action is created beforehand: PGlite has a single connection, so a query
 * outside the open transaction would hang.
 */
const fakeEvaluationWriting = async (): Promise<EvaluateSimulation> => {
  const action = await actionFactory.published().create()
  return (_engine, { id }, { session }) =>
    createActionAssessments(
      [{ simulationId: id, actionId: action.id, applicable: true, impact: 1 }],
      { session }
    )
}

const findActionAssessments = (simulationId: string) =>
  prisma.actionAssessment.findMany({ where: { simulationId } })

describe('processNextPendingComputation', () => {
  const engine = createTestEngine({})
  const getEngine = () => engine

  beforeEach(() => {
    evaluateSimulation.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    evaluateSimulation.mockReset()
    await emptyDatabase(prisma)
  })

  it('returns success(false) when no job is pending', async () => {
    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(false))
    expect(evaluateSimulation).not.toHaveBeenCalled()
  })

  it('evaluates the claimed simulation and marks its job completed', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))
    expect(evaluateSimulation).toHaveBeenCalledExactlyOnceWith(
      engine,
      { id: simulation.id, model: serializeModel(simulation.model) },
      { session: expect.anything() }
    )

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it("sets the simulation's situation before evaluating it", async () => {
    const situatedEngine = createTestEngine({
      transport: null,
      'transport . voiture': null,
      'transport . voiture . km': { question: 'Combien ?', unité: 'km' },
    })
    await simulationFactory
      .completed()
      .withPendingComputation()
      .params({ situation: { 'transport . voiture . km': 12000 } })
      .create()

    let evaluatedKm: unknown
    evaluateSimulation.mockImplementation((evaluatedEngine) => {
      evaluatedKm = evaluatedEngine.evaluate(
        'transport . voiture . km'
      ).nodeValue
      return Promise.resolve()
    })

    await processNextPendingComputation(() => situatedEngine)

    expect(evaluatedKm).toBe(12000)
  })

  it('commits the evaluation writes together with the completed status', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()

    evaluateSimulation.mockImplementation(await fakeEvaluationWriting())

    await processNextPendingComputation(getEngine)

    expect(await findActionAssessments(simulation.id)).toHaveLength(1)
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
  })

  it('rolls the evaluation writes back and marks the job failed when the evaluation throws', async () => {
    const simulation = await simulationFactory
      .completed()
      .withPendingComputation()
      .create()

    const writeAnActionAssessment = await fakeEvaluationWriting()
    evaluateSimulation.mockImplementation(async (...args) => {
      await writeAnActionAssessment(...args)
      throw new Error('Engine evaluation failed')
    })

    const result = await processNextPendingComputation(getEngine)

    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected processNextPendingComputation to fail')
    }
    expect(result.error).toBeInstanceOf(SimulationComputationFailedError)

    expect(await findActionAssessments(simulation.id)).toHaveLength(0)
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })

  it('reprocesses a reclaimed stale job without a duplicate-key failure', async () => {
    const simulation = await simulationFactory
      .completed()
      .withStaleProcessingComputation()
      .create()

    evaluateSimulation.mockImplementation(await fakeEvaluationWriting())

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))
    expect(await findActionAssessments(simulation.id)).toHaveLength(1)
    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
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

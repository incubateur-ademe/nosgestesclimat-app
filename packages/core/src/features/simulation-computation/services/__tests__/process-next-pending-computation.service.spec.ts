import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { SimulationComputationFailedError } from '../../exceptions/simulation-computation.exception.ts'
import { createTestEngine } from '../../factories/engine.factory.ts'
import { simulationComputationFactory } from '../../factories/simulation-computation.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import { createProcessNextPendingComputation } from '../process-next-pending-computation.service.ts'

const mockAssessActions = vi.fn()

const processNextPendingComputation = createProcessNextPendingComputation({
  assessActions: mockAssessActions,
})

describe('processNextPendingComputation', () => {
  const engine = createTestEngine({})
  const getEngine = () => engine

  beforeEach(() => {
    mockAssessActions.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await prisma.simulationComputation.deleteMany()
    await prisma.simulation.deleteMany()
  })

  it('returns success(false) when no job is pending', async () => {
    const result = await processNextPendingComputation(getEngine)
    expect(result).toEqual(success(false))
  })

  it('processes a pending job end-to-end', async () => {
    const simulation = await simulationComputationFactory
      .withPendingComputation()
      .create()

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('reclaims stale processing jobs past the timeout', async () => {
    const simulation = await simulationComputationFactory
      .completed()
      .withStaleProcessingComputation()
      .create()

    const result = await processNextPendingComputation(getEngine)

    expect(result).toEqual(success(true))

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('marks the computation as failed and returns a failure when an error occurs', async () => {
    const simulation = await simulationComputationFactory
      .completed()
      .withPendingComputation()
      .create()

    mockAssessActions.mockRejectedValue(new Error('Engine evaluation failed'))

    const result = await processNextPendingComputation(getEngine)
    expect(result.success).toBe(false)
    if (result.success) {
      throw new Error('Expected processNextPendingComputation to fail')
    }
    expect(result.error).toBeInstanceOf(SimulationComputationFailedError)

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })
})

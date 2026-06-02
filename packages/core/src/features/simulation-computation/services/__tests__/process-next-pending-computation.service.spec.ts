import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { SimulationComputationFailedException } from '../../exceptions/simulation-computation.exception.ts'
import { createTestEngine } from '../../factories/engine.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import { processNextPendingComputation } from '../process-next-pending-computation.service.ts'

const { assessActions: mockAssessActions } = vi.hoisted(() => ({
  assessActions: vi.fn(),
}))

vi.mock('../../../actions/services/assess-actions.service.ts', () => ({
  assessActions: mockAssessActions,
}))

describe('processNextPendingComputation', () => {
  const engine = createTestEngine({})

  beforeEach(() => {
    mockAssessActions.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await prisma.simulationComputation.deleteMany()
    await prisma.simulation.deleteMany()
  })

  it('returns false when no job is pending', async () => {
    const result = await processNextPendingComputation(engine)
    expect(result).toBe(false)
  })

  it('processes a pending job end-to-end', async () => {
    const simulation = await simulationFactory.withPendingComputation().create()

    const result = await processNextPendingComputation(engine)

    expect(result).toBe(true)

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('reclaims stale processing jobs past the timeout', async () => {
    const simulation = await simulationFactory
      .withProgression(1)
      .withStaleProcessingComputation()
      .create()

    const result = await processNextPendingComputation(engine)

    expect(result).toBe(true)

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('marks the computation as failed and throws SimulationComputationFailedException when an error occurs', async () => {
    const simulation = await simulationFactory
      .withProgression(1)
      .withPendingComputation()
      .create()

    mockAssessActions.mockRejectedValue(new Error('Engine evaluation failed'))

    await expect(processNextPendingComputation(engine)).rejects.toThrow(
      SimulationComputationFailedException
    )

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })
})

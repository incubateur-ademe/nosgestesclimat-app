import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../prisma/client.ts'
import { createTestEngine } from '../factories/engine.factory.ts'
import { simulationFactory } from '../factories/simulation.factory.ts'
import { findSimulationComputation } from '../repositories/simulation-computations.repository.ts'
import { processNextPendingComputation } from '../services/coordination.service.ts'

const { computeDerivedSimulationData: mockCompute } = vi.hoisted(() => ({
  computeDerivedSimulationData: vi.fn(),
}))

vi.mock('../services/simulation-computation.service.ts', () => ({
  computeDerivedSimulationData: mockCompute,
}))

describe('coordination service', () => {
  const engine = createTestEngine({})

  beforeEach(() => {
    mockCompute.mockResolvedValue(undefined)
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
      .withStaleProcessingComputation()
      .create()

    const result = await processNextPendingComputation(engine)

    expect(result).toBe(true)

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('marks the computation as failed and rethrows when an error occurs', async () => {
    const simulation = await simulationFactory.withPendingComputation().create()

    mockCompute.mockRejectedValue(new Error('Engine evaluation failed'))

    await expect(processNextPendingComputation(engine)).rejects.toThrow(
      'Engine evaluation failed'
    )

    const computation = await findSimulationComputation(simulation.id)
    expect(computation!.status).toBe('failed')
  })
})

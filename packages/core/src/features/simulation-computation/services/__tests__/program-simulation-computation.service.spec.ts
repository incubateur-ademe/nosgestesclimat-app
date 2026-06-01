import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import {
  SimulationNotFinished,
  UnsupportedModel,
} from '../../exceptions/simulation-computation.exception.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import { programSimulationComputation } from '../program-simulation-computation.ts'

vi.mock('@incubateur-ademe/nosgestesclimat/package.json', () => ({
  default: { version: '1.0.0' },
}))

const { log: mockLog } = vi.hoisted(() => ({ log: vi.fn() }))
vi.mock('../../../logger/index.ts', () => ({ log: mockLog }))

describe('programSimulationComputation', () => {
  afterEach(async () => {
    await prisma.simulationComputation.deleteMany()
    await prisma.simulation.deleteMany()
    vi.clearAllMocks()
  })

  it('throws SimulationNotFinished when progression is not 1', async () => {
    const { id } = await simulationFactory.params({ progression: 0.5 }).create()

    await expect(programSimulationComputation(id)).rejects.toThrow(
      SimulationNotFinished
    )
  })

  it('logs UnsupportedModel and does not create a computation when model is a PR version', async () => {
    const { id } = await simulationFactory
      .withModelVersion({ PRNumber: '42' })
      .create()

    await programSimulationComputation(id)

    expect(mockLog).toHaveBeenCalledWith(expect.any(UnsupportedModel))
    const computation = await findSimulationComputation(id)
    expect(computation).toBeNull()
  })

  it('logs UnsupportedModel and does not create a computation when model version is outdated', async () => {
    const { id } = await simulationFactory
      .withModelVersion({ publishedTag: '0.9.0' })
      .create()

    await programSimulationComputation(id)

    expect(mockLog).toHaveBeenCalledWith(expect.any(UnsupportedModel))
    const computation = await findSimulationComputation(id)
    expect(computation).toBeNull()
  })

  it('creates a pending computation when simulation is finished and model matches current version', async () => {
    const { id } = await simulationFactory.create()

    await programSimulationComputation(id)

    const computation = await findSimulationComputation(id)
    expect(computation).not.toBeNull()
    expect(computation!.status).toBe('pending')
  })
})

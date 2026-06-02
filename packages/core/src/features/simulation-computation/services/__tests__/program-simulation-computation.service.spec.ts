import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import {
  SimulationNotFinishedException,
  UnsupportedModelException,
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
      SimulationNotFinishedException
    )
  })

  describe('logs UnsupportedModel and does not create a computation', () => {
    it.each([
      [
        'when model version is outdated',
        () =>
          simulationFactory
            .withProgression(1)
            .withModelVersion({ publishedTag: '0.9.0' }),
      ],
      [
        'when model version is a PR version',
        () =>
          simulationFactory
            .withProgression(1)
            .withModelVersion({ PRNumber: '42' }),
      ],
      [
        'when model is unsupported region',
        () => simulationFactory.withProgression(1).withModelRegion('UK'),
      ],
      [
        'when model is unsupported language',
        () => simulationFactory.withProgression(1).withModelLocale('en'),
      ],
    ])('%s', async (_, setup) => {
      const { id } = await setup().create()
      await programSimulationComputation(id)
      expect(mockLog).toHaveBeenCalledWith(
        expect.any(UnsupportedModelException)
      )
      const computation = await findSimulationComputation(id)
      expect(computation).toBeNull()
    })
  })

  it('creates a pending computation when simulation is finished and model matches current version', async () => {
    const { id } = await simulationFactory
      .withProgression(1)
      .withModelRegion('FR')
      .create()

    await programSimulationComputation(id)

    const computation = await findSimulationComputation(id)
    expect(computation).not.toBeNull()
    expect(computation!.status).toBe('pending')
  })
})

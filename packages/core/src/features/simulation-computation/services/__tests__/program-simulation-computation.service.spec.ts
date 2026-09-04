import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import type { ModelRegion } from '../../../simulations/types/model.ts'
import { SimulationNotFinishedException } from '../../exceptions/simulation-computation.exception.ts'
import { PREVIOUS_MODEL_VERSION } from '../../model-support/model-versions.ts'
import { findSimulationComputation } from '../../repositories/simulation-computations.repository.ts'
import { createProgramSimulationComputation } from '../program-simulation-computation.ts'

vi.mock('@incubateur-ademe/nosgestesclimat/package.json', () => ({
  default: { version: '1.0.0' },
}))

const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
const captureException = vi.fn()
const programSimulationComputation = createProgramSimulationComputation({
  logger,
  captureException,
})

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
            .completed()
            .withModelVersion({ publishedTag: '0.9.0' }),
      ],
      [
        'when model version is a PR version',
        () =>
          simulationFactory.completed().withModelVersion({ PRNumber: '42' }),
      ],
      [
        'when model region does not exist in the model package',
        () =>
          simulationFactory.completed().withModelRegion('ZZ' as ModelRegion),
      ],
    ])('%s', async (_, setup) => {
      const { id } = await setup().create()
      await programSimulationComputation(id)
      expect(logger.error).toHaveBeenCalledWith(
        '[program-simulation-computation] Unsupported model',
        expect.objectContaining({ model: expect.anything() })
      )
      const computation = await findSimulationComputation(id)
      expect(computation).toBeNull()
    })
  })

  it.each([
    [
      'FR region, current version',
      () => simulationFactory.completed().withModelRegion('FR'),
    ],
    [
      'a non-FR region, current version',
      () => simulationFactory.completed().withModelRegion('UK'),
    ],
    [
      'en locale, current version',
      () => simulationFactory.completed().withModelLocale('en'),
    ],
    [
      'previous version',
      () =>
        simulationFactory
          .completed()
          .withModelVersion({ publishedTag: PREVIOUS_MODEL_VERSION }),
    ],
  ])(
    'creates a pending computation when simulation is finished and model is supported: %s',
    async (_, setup) => {
      const { id } = await setup().create()

      await programSimulationComputation(id)

      const computation = await findSimulationComputation(id)
      expect(computation).not.toBeNull()
      expect(computation!.status).toBe('pending')
    }
  )
})

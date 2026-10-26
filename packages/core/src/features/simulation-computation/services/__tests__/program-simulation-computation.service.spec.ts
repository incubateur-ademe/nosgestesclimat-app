import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { SimulationNotFoundError } from '../../../simulations/errors/simulations.error.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import {
  ComputationAlreadyExistsError,
  SimulationNotFinishedError,
} from '../../errors/simulation-computation.error.ts'
import type * as SimulationComputationRepository from '../../repositories/simulation-computations.repository.ts'
import {
  createSimulationComputation,
  findSimulationComputation,
} from '../../repositories/simulation-computations.repository.ts'
import { createProgramSimulationComputation } from '../program-simulation-computation.ts'

vi.mock('@incubateur-ademe/nosgestesclimat/package.json', () => ({
  default: { version: '1.0.0' },
}))

// Delegate to the real repository by default, but expose
// `createSimulationComputation` as a mock so a single test can force a failure.
vi.mock(
  '../../repositories/simulation-computations.repository.ts',
  async (importOriginal) => {
    const actual =
      (await importOriginal()) as typeof SimulationComputationRepository
    return {
      ...actual,
      createSimulationComputation: vi.fn(actual.createSimulationComputation),
    }
  }
)

const logger = createTestLogger()
const programSimulationComputation = createProgramSimulationComputation({
  logger,
})

describe('programSimulationComputation', () => {
  afterEach(async () => {
    await prisma.simulationComputation.deleteMany()
    await prisma.simulation.deleteMany()
    vi.clearAllMocks()
  })

  it.each([0.5, 0])(
    'throws SimulationNotFinishedError when progression is %s',
    async (progression) => {
      const { id } = await simulationFactory.params({ progression }).create()

      await expect(programSimulationComputation(id)).rejects.toThrow(
        SimulationNotFinishedError
      )
    }
  )

  it('throws SimulationNotFoundError when the simulation does not exist', async () => {
    await expect(
      programSimulationComputation(crypto.randomUUID())
    ).rejects.toThrow(SimulationNotFoundError)
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
      // The engine registry retrieves any published version, so an outdated
      // tag is no longer a reason to drop the job.
      'an outdated published version',
      () =>
        simulationFactory
          .completed()
          .withModelVersion({ publishedTag: '0.9.0' }),
    ],
    [
      'a PR version',
      () => simulationFactory.completed().withModelVersion({ PRNumber: '42' }),
    ],
  ])(
    'creates a pending computation when simulation is finished: %s',
    async (_, setup) => {
      const { id } = await setup().create()

      await programSimulationComputation(id)

      const computation = await findSimulationComputation(id)
      expect(computation).not.toBeNull()
      expect(computation!.status).toBe('pending')
    }
  )

  it('logs a warning when a computation already exists for the same finished simulation', async () => {
    const { id } = await simulationFactory.completed().create()

    await programSimulationComputation(id)
    await programSimulationComputation(id)

    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(ComputationAlreadyExistsError)
    )
  })

  it('propagates a failure from createSimulationComputation', async () => {
    const { id } = await simulationFactory.completed().create()
    vi.mocked(createSimulationComputation).mockRejectedValueOnce(
      new Error('db down')
    )

    await expect(programSimulationComputation(id)).rejects.toThrow('db down')
  })
})

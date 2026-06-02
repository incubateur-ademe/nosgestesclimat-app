import { faker } from '@faker-js/faker'
import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import { serializeModel } from '../../simulations/repository/model.mapper.ts'
import type {
  Model,
  ModelLocale,
  ModelRegion,
} from '../../simulations/types/model.ts'

interface SimulationFixture {
  id: string
  userId: string | null
  progression: number
  createdAt: Date
  model: Model
}

interface SimulationTransientParams {
  progression?: number
  modelVersion?: Model['version']
  modelRegion?: ModelRegion
  modelLocale?: ModelLocale
}

class SimulationFactory extends Factory<
  SimulationFixture,
  SimulationTransientParams,
  SimulationFixture
> {
  withProgression(progression: number) {
    return this.params({ progression })
  }
  withModelVersion(version: Model['version']) {
    return this.transient({ modelVersion: version })
  }
  withModelRegion(region: ModelRegion) {
    return this.transient({ modelRegion: region })
  }
  withModelLocale(lang: ModelLocale) {
    return this.transient({ modelLocale: lang })
  }

  started() {
    return this.params({ progression: 0.1 })
  }

  completed() {
    return this.params({ progression: 1 })
  }

  withComputationStatus(
    status: 'completed' | 'pending' | 'processing' | 'failed'
  ) {
    return this.afterCreate(async (data) => {
      const startedAt =
        status !== 'pending' ? faker.date.recent({ days: 1 }) : undefined
      const completedAt =
        (status === 'completed' || status === 'failed') && startedAt
          ? faker.date.between({ from: startedAt, to: new Date() })
          : undefined
      await prisma.simulationComputation.create({
        data: { simulationId: data.id, status, startedAt, completedAt },
      })
      return data
    })
  }

  withPendingComputation() {
    return this.withComputationStatus('pending')
  }

  withStaleProcessingComputation() {
    return this.afterCreate(async (data) => {
      await prisma.simulationComputation.create({
        data: {
          simulationId: data.id,
          status: 'processing',
          startedAt: new Date(Date.now() - 60_000),
        },
      })
      return data
    })
  }

  withCompletedComputation() {
    return this.withComputationStatus('completed')
  }

  withFailedComputation() {
    return this.withComputationStatus('failed')
  }
}

export const simulationFactory = SimulationFactory.define(
  ({ onCreate, transientParams }) => {
    onCreate(async (data) => {
      await prisma.simulation.create({
        data: {
          id: data.id,
          date: new Date(),
          progression: data.progression,
          model: serializeModel(data.model),
          computedResults: {},
          situation: {},
          actionChoices: {},
          userId: data.userId,
          createdAt: data.createdAt,
        },
      })
      return data
    })

    return {
      id: faker.string.uuid(),
      userId: null,
      progression: faker.number.float({ min: 0, max: 1 }),
      createdAt: new Date(),
      model: {
        region:
          transientParams.modelRegion ??
          (faker.helpers.arrayElement(
            Object.keys(supportedRegions)
          ) as ModelRegion),
        locale: transientParams.modelLocale ?? ('fr' as const),
        version: transientParams.modelVersion ?? {
          publishedTag: pkg.version,
        },
      },
    }
  }
)

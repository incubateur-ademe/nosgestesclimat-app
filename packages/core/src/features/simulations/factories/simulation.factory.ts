import { faker } from '@faker-js/faker'
import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import { serializeModel } from '../repository/model.mapper.ts'
import type { Model, ModelLocale, ModelRegion } from '../types/model.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

interface SimulationTransientParams {
  progression?: number
  modelVersion?: Model['version']
  modelRegion?: ModelRegion
  modelLocale?: ModelLocale
}

class SimulationFactory extends Factory<
  Simulation,
  SimulationTransientParams,
  Simulation
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
  withDeprecatedComputedResults() {
    return this.params({
      computedResults: { bilan: 1000 } as unknown as ComputedResults,
    })
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
          date: data.date,
          progression: data.progression,
          model: serializeModel(data.model),
          computedResults:
            data.computedResults as unknown as Prisma.InputJsonValue,
          situation: data.situation as unknown as Prisma.InputJsonValue,
          foldedSteps: data.foldedSteps as unknown as Prisma.InputJsonValue[],
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      })
      return data
    })

    return {
      id: faker.string.uuid(),
      userId: null,
      progression: faker.number.float({ min: 0, max: 1 }),
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
      situation: {},
      foldedSteps: [],
      computedResults: zeroedComputedResults,
    }
  }
)

const zeroedComputedResults: ComputedResults = {
  carbone: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
  eau: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
}

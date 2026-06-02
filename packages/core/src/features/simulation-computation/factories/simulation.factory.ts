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
  progression: number
  model: Model
}

interface SimulationTransientParams {
  modelVersion?: Model['version']
  modelRegion?: ModelRegion
  modelLocale?: ModelLocale
}

class SimulationFactory extends Factory<
  SimulationFixture,
  SimulationTransientParams,
  SimulationFixture
> {
  withModelVersion(version: Model['version']) {
    return this.transient({ modelVersion: version })
  }
  withModelRegion(region: ModelRegion) {
    return this.transient({ modelRegion: region })
  }
  withModelLocale(lang: ModelLocale) {
    return this.transient({ modelLocale: lang })
  }
  withPendingComputation() {
    return this.afterCreate(async (data) => {
      await prisma.simulationComputation.create({
        data: {
          simulationId: data.id,
          status: 'pending',
        },
      })
      return data
    })
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
        },
      })
      return data
    })

    return {
      id: faker.string.uuid(),
      progression: 1,
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

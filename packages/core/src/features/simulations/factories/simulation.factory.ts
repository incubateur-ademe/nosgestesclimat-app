import { faker } from '@faker-js/faker'
import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import type { DeepPartial, GeneratorFn } from 'fishery'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import { serializeModel } from '../repository/model.mapper.ts'
import type { Model, ModelLocale, ModelRegion } from '../types/model.ts'
import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'

interface SimulationFixture {
  id: string
  userId: string | null
  progression: number
  createdAt: Date
  model: Model
  computedResults: ComputedResultSchema
  situation: object
}

interface SimulationTransientParams {
  progression?: number
  modelVersion?: Model['version']
  modelRegion?: ModelRegion
  modelLocale?: ModelLocale
}

export class SimulationFactory extends Factory<
  SimulationFixture,
  SimulationTransientParams,
  SimulationFixture
> {
  withProgression(progression: number): this {
    return this.params({ progression })
  }
  withModelVersion(version: Model['version']): this {
    return this.transient({ modelVersion: version })
  }
  withModelRegion(region: ModelRegion): this {
    return this.transient({ modelRegion: region })
  }
  withModelLocale(lang: ModelLocale): this {
    return this.transient({ modelLocale: lang })
  }

  started(): this {
    return this.params({ progression: 0.1 })
  }

  completed(): this {
    return this.params({ progression: 1 })
  }
}

const METRIC_CATEGORIES = [
  'alimentation',
  'transport',
  'logement',
  'divers',
  'services sociétaux',
] as const

const randomCategories = (): ComputedResultSchema['carbone']['categories'] =>
  Object.fromEntries(
    METRIC_CATEGORIES.map((category) => [
      category,
      faker.number.int({ min: 0, max: 100_000 }),
    ])
  ) as ComputedResultSchema['carbone']['categories']

const randomSubcategories = (): Record<string, number> =>
  Object.fromEntries(
    Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, (_, index) => [
      `subcategory-${index}`,
      faker.number.int({ min: 0, max: 100_000 }),
    ])
  )

const randomMetric = (): ComputedResultSchema['carbone'] => ({
  bilan: faker.number.int({ min: 0, max: 100_000 }),
  categories: randomCategories(),
  subcategories: randomSubcategories(),
})

/**
 * Generates a random, fully-populated `ComputedResultSchema` for test fixtures.
 */
export const createComputedResults = (): ComputedResultSchema => ({
  carbone: randomMetric(),
  eau: randomMetric(),
})

/**
 * Shared definition of the `Simulation` fixture, reused by subclasses that
 * attach downstream aggregates (e.g. `SimulationComputationFactory`).
 */
export const simulationGenerator: GeneratorFn<
  SimulationFixture,
  SimulationTransientParams,
  SimulationFixture,
  DeepPartial<SimulationFixture>
> = ({ onCreate, transientParams }) => {
  onCreate(async (data) => {
    await prisma.simulation.create({
      data: {
        id: data.id,
        date: new Date(),
        progression: data.progression,
        model: serializeModel(data.model),
        computedResults: data.computedResults as Prisma.InputJsonValue,
        situation: data.situation as Prisma.InputJsonValue,
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
    computedResults: createComputedResults(),
    situation: {},
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

export const simulationFactory = SimulationFactory.define(simulationGenerator)

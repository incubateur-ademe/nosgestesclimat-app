/**
 * Ported from the legacy server (apps/server/src/features/simulations/simulations.service.ts).
 * Does not meet core quality standards and will be replaced by an
 * engine-based evaluation in Phase 2.
 */
import type {
  DottedName,
  FunFacts,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import modelRules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import * as v from 'valibot'
import { prisma } from '../../../../prisma/client.ts'
import type { Logger } from '../../../logger/index.ts'
import { ComputedResultSchema } from '../../../simulations/validators/computed-results.schema.ts'
import { getSituationDottedNameValue } from './evaluate-situation.ts'
import { SituationSchema } from './situation.schema.ts'
import { sumNested } from './sum-nested.ts'

const MAX_VALUE = 100000
const BATCH_SIZE = 100

const frRules = modelRules as Partial<NGCRules>
const funFactsRules = modelFunFacts as { [k in keyof FunFacts]: DottedName }

const getEmptyComputedResults = (): ComputedResultSchema => ({
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
})

type SimulationToCompute = {
  progression: number
  computedResults: ComputedResultSchema
  situation: SituationSchema
}

const isValidSimulation = (simulation: {
  progression: number
  computedResults: unknown
  situation: unknown
}): simulation is SimulationToCompute => {
  if (simulation.progression !== 1) {
    return false
  }

  const computedResults = v.safeParse(
    ComputedResultSchema,
    simulation.computedResults
  )

  const situation = v.safeParse(SituationSchema, simulation.situation)

  if (computedResults.issues || situation.issues) {
    return false
  }

  return [
    computedResults.output.carbone.bilan,
    ...Object.values(computedResults.output.carbone.categories),
  ].every((value) => value <= MAX_VALUE)
}

async function* batchPollSimulations(pollId: string) {
  let cursor: { id: string } | undefined

  while (true) {
    const rows = await prisma.simulationPoll.findMany({
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor } : {}),
      where: { pollId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        simulation: {
          select: {
            progression: true,
            computedResults: true,
            situation: true,
          },
        },
      },
    })

    if (rows.length === 0) {
      break
    }

    for (const row of rows) {
      yield row.simulation
    }

    cursor = { id: rows[rows.length - 1].id }
  }
}

export function createComputePollStats({ logger }: { logger: Logger }) {
  return async function computePollStats(pollId: string): Promise<{
    computedResults: ComputedResultSchema
    funFacts: FunFacts
  }> {
    let simulationCount = 0
    let computedResults = getEmptyComputedResults()
    const funFactValues: { [key in DottedName]?: number } = {}

    for await (const simulation of batchPollSimulations(pollId)) {
      if (!isValidSimulation(simulation)) {
        continue
      }

      simulationCount++
      computedResults = sumNested(
        computedResults,
        simulation.computedResults
      ) as ComputedResultSchema

      for (const dottedName of Object.values(funFactsRules)) {
        if (dottedName in frRules) {
          let value = 0
          try {
            value = getSituationDottedNameValue({
              dottedName,
              situation: simulation.situation,
              rules: frRules,
            })
          } catch (error) {
            logger.error('Cannot evaluate dottedName', { dottedName, error })
          }
          funFactValues[dottedName] = (funFactValues[dottedName] || 0) + value
        }
      }
    }

    const funFacts = Object.fromEntries(
      Object.entries(funFactsRules).map(([key, dottedName]) => {
        let value = funFactValues[dottedName] || 0

        if (key.startsWith('average')) {
          value = value / simulationCount
        }

        if (key.startsWith('percentage')) {
          value = (value / simulationCount) * 100
        }

        return [key, value]
      })
    ) as FunFacts

    return { computedResults, funFacts }
  }
}

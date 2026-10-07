import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import { seedActionAssessments } from '../../actions/seeds/action-assessments.seed.ts'
import { simulationFactory } from '../factories/simulation.factory.ts'
import type { Model } from '../types/model.ts'
import {
  getPersonaActionAssessments,
  getPersonaComputations,
  pickPersonaName,
} from './persona-computations.ts'

const COMPLETED_PROGRESSION = 1

/**
 * The model demo simulations are answered against: the installed model, exactly
 * as the app records it when a simulation is completed. The version is reduced
 * to its `major.minor.patch`, which is the shape the database accepts.
 */
const SEED_MODEL: Model = {
  locale: 'fr',
  region: 'FR',
  version: {
    publishedTag: pkg.version.match(/^(\d+\.\d+\.\d+)/)!.pop()!,
  },
}

export interface SimulationSeedShape {
  count: number
  /** When set, the simulations belong to this user. Anonymous otherwise. */
  userId?: string
  /** When set, the simulations are attached to this poll as its participants. */
  pollId?: string
}

/**
 * Seeds `count` finished simulations, each answered from a persona drawn at
 * random.
 *
 * The personas are evaluated once and cached, so the situations, footprints and
 * action assessments they yield are computed once each, however many
 * simulations are drawn from them.
 *
 * Returns the ids of the simulations it created.
 */
export const seedSimulations = async ({
  count,
  userId,
  pollId,
}: SimulationSeedShape): Promise<string[]> => {
  const personaNames = Array.from({ length: count }, pickPersonaName)

  const computations = getPersonaComputations(personaNames)

  const factory = pollId
    ? simulationFactory.withPollId(pollId)
    : simulationFactory

  const simulationIds: string[] = []

  for (const personaName of personaNames) {
    const computation = computations.get(personaName)

    if (!computation) {
      throw new Error(`No computation cached for persona "${personaName}".`)
    }

    const simulation = await factory.create({
      // Anonymous by default: a poll participation is recorded without an
      // account, and only an account-owning batch passes a userId.
      userId: userId ?? null,
      model: SEED_MODEL,
      date: new Date(),
      progression: COMPLETED_PROGRESSION,
      situation: computation.situation,
      foldedSteps: [],
      computedResults: computation.computedResults,
    })

    simulationIds.push(simulation.id)
  }

  await seedActionAssessments({
    simulationIds,
    personaNames,
    assessmentsByPersona: getPersonaActionAssessments(personaNames),
  })

  return simulationIds
}

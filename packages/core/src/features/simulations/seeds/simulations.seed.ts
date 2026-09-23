import pkg from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import { randomUUID } from 'node:crypto'
import { prisma } from '../../../prisma/client.ts'
import { toNewActionAssessment } from '../../actions/helpers/action-assessment.ts'
import { createActionAssessments } from '../../actions/repositories/action-assessments.repository.ts'
import { createManySimulations } from '../repository/simulation.repository.ts'
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
export const seedSimulations = async (
  shape: SimulationSeedShape
): Promise<string[]> => {
  const personaNames = Array.from({ length: shape.count }, pickPersonaName)

  const computations = getPersonaComputations(personaNames)

  const simulationIds = personaNames.map(() => randomUUID())

  await createManySimulations(
    personaNames.map((personaName, index) => {
      const computation = computations.get(personaName)

      if (!computation) {
        throw new Error(`No computation cached for persona "${personaName}".`)
      }

      return {
        id: simulationIds[index],
        // Anonymous by default: a poll participation is recorded without an
        // account, and only an account-owning batch passes a userId.
        userId: shape.userId ?? null,
        model: SEED_MODEL,
        date: new Date(),
        progression: COMPLETED_PROGRESSION,
        situation: computation.situation,
        foldedSteps: [],
        computedResults: computation.computedResults,
      }
    })
  )

  // Only an account's own simulation carries assessments: they are what the
  // personalised actions pages read, and nobody reads the actions of an
  // anonymous participant. Seeding them for a campaign would mean writing one
  // row per action for each of its participants.
  if (shape.userId) {
    await seedActionAssessments({
      simulationIds,
      personaNames,
      assessmentsByPersona: getPersonaActionAssessments(personaNames),
    })
  }

  return simulationIds
}

/**
 * The actions of the catalogue, as a rule id -> action id lookup.
 *
 * Scoped like the worker's own `findActionRuleIds`, so seeds and real
 * computations assess the same set of actions.
 *
 * The catalogue is a prerequisite of these seeds rather than something they
 * create: it comes from the Notion sync. Seeding without it would produce
 * simulations whose actions page stays empty, so it fails loudly instead.
 */
const readActionIdsByRuleId = async (): Promise<Map<string, string>> => {
  const actions = await prisma.action.findMany({
    where: { deletedAt: null },
    select: { id: true, ruleId: true },
  })

  if (actions.length === 0) {
    throw new Error(
      'No action found to assess: the seeded simulation would carry no ' +
        'action assessment. Run `pnpm -F server jobs:syncNotionActions` first.'
    )
  }

  return new Map(actions.map(({ id, ruleId }) => [ruleId, id]))
}

/**
 * Persists, for each seeded simulation, how the model's actions apply to the
 * situation it was answered from.
 *
 * The assessments are keyed on the simulation, not on the persona it was drawn
 * from: every simulation gets its own rows, attached to its own `simulationId`,
 * even when several were answered from the same persona.
 *
 * The assessments go through the same repository the worker writes through, so
 * the seeded rows carry exactly what a real computation would have produced.
 */
const seedActionAssessments = async ({
  simulationIds,
  personaNames,
  assessmentsByPersona,
}: {
  simulationIds: string[]
  personaNames: string[]
  assessmentsByPersona: ReturnType<typeof getPersonaActionAssessments>
}): Promise<void> => {
  const actionIdByRuleId = await readActionIdsByRuleId()

  const assessments = personaNames.flatMap((personaName, index) => {
    const personaAssessments = assessmentsByPersona.get(personaName)

    if (!personaAssessments) return []

    const simulationId = simulationIds[index]

    return personaAssessments.flatMap(({ ruleId, applicability }) => {
      const actionId = actionIdByRuleId.get(ruleId)

      if (!actionId) return []

      return [toNewActionAssessment({ simulationId, actionId }, applicability)]
    })
  })

  if (assessments.length === 0) return

  await createActionAssessments(assessments)
}

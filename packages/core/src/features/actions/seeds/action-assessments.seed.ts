import { prisma } from '../../../prisma/client.ts'
import type { PersonaName } from '../../simulations/seeds/persona-computations.ts'
import { getPersonaActionAssessments } from '../../simulations/seeds/persona-computations.ts'
import { toNewActionAssessment } from '../helpers/action-assessment.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'

/**
 * The actions of the catalogue, as a rule id -> action id lookup.
 *
 * The catalogue is a prerequisite of these seeds rather than something they
 * create: it comes from the Notion sync. Seeding without it would produce
 * simulations whose actions page stays empty, so the seed fails loudly instead.
 *
 * Read once for the process: it does not change while a seed runs, and every
 * seeded simulation asks for it.
 */
let actionIdsByRuleId: Map<string, string> | undefined

const readActionIdsByRuleId = async (): Promise<Map<string, string>> => {
  if (actionIdsByRuleId) return actionIdsByRuleId

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

  actionIdsByRuleId = new Map(actions.map(({ id, ruleId }) => [ruleId, id]))

  return actionIdsByRuleId
}

/**
 * Fails when the catalogue is missing.
 *
 * Meant to be called before a seed writes anything: the accounts, campaigns and
 * simulations it creates come first, and failing only on the assessments would
 * leave them behind, unseedable and unusable.
 */
export const assertActionCatalogueIsSeeded = async (): Promise<void> => {
  await readActionIdsByRuleId()
}

/**
 * Persists, for one seeded simulation, how the model's actions apply to the
 * situation it was answered from.
 *
 * Everything is derived from the persona the simulation was drawn from, so the
 * assessments describe that simulation and no other: the caller passes the same
 * persona it used for the situation and the computed results.
 */
export const seedActionAssessments = async ({
  simulationId,
  personaName,
}: {
  simulationId: string
  personaName: PersonaName
}): Promise<void> => {
  const actionIdByRuleId = await readActionIdsByRuleId()

  const assessments = getPersonaActionAssessments(personaName).flatMap(
    ({ ruleId, applicability }) => {
      const actionId = actionIdByRuleId.get(ruleId)

      if (!actionId) return []

      return [toNewActionAssessment({ simulationId, actionId }, applicability)]
    }
  )

  if (assessments.length === 0) return

  await createActionAssessments(assessments)
}

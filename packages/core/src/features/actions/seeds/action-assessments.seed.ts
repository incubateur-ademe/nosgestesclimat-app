import { prisma } from '../../../prisma/client.ts'
import { toNewActionAssessment } from '../helpers/action-assessment.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import type { ActionEvaluation } from '../types/action.ts'

/**
 * The actions of the catalogue, as a rule id -> action id lookup.
 *
 * The catalogue is a prerequisite of these seeds rather than something they
 * create: it comes from the Notion sync. Seeding without it would produce
 * simulations whose actions page stays empty, so the seed fails loudly instead.
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

export const assertActionCatalogueIsSeeded = async (): Promise<void> => {
  await readActionIdsByRuleId()
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
export const seedActionAssessments = async ({
  simulationIds,
  personaNames,
  assessmentsByPersona,
}: {
  simulationIds: string[]
  personaNames: string[]
  assessmentsByPersona: Map<
    string,
    { ruleId: string; applicability: ActionEvaluation }[]
  >
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

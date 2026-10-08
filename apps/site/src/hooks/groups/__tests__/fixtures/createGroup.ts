import { faker } from '@faker-js/faker'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json'
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json'
import { getComputedResults } from '@nosgestesclimat/core/features/simulations/helpers/get-computed-results'
import Engine from 'publicodes'

const engine = new Engine<DottedName>(rules as Partial<NGCRules>, {
  logger: { warn: () => {}, error: () => {}, log: () => {} },
  strict: {
    situation: false,
    noOrphanRule: false,
  },
})

function createSimulation({ persona }: { persona?: string }) {
  // Get computed results from the engine
  engine.setSituation(
    personas[`personas . ${persona}` as keyof typeof personas].situation
  )

  return {
    id: faker.string.uuid(),
    date: faker.date.recent().toISOString(),
    foldedSteps: [],
    situation: {},
    computedResults: getComputedResults(engine),
    progression: 1,
  }
}

export function createGroup({
  participants,
  currentUserId,
}: {
  participants: string[]
  currentUserId: string
}) {
  return {
    participants: participants.map((p, index) => ({
      // We set the first participant as the current user
      userId: !index ? currentUserId : faker.string.uuid(),
      simulation: createSimulation({ persona: p }),
      name: p || faker.person.firstName(),
      _id: faker.database.mongodbObjectId(),
    })),
  }
}

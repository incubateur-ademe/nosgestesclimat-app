import { faker } from '@faker-js/faker'
import type { DottedName, Persona } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import type Engine from 'publicodes'
import type { Situation } from 'publicodes'
import {
  buildRuleIdToDottedName,
  evaluateAction,
} from '../../actions/helpers/action-assessment.ts'
import type { ActionEvaluation } from '../../actions/types/action.ts'
import { createTestEngine } from '../../simulation-computation/factories/engine.factory.ts'
import { getComputedResults } from '../../simulations/helpers/get-computed-results.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'

/**
 * The model's personas, keyed by display name.
 */
const personasByName = Object.fromEntries(
  Object.values(personas as Record<string, Persona>).map(
    (persona) => [persona.nom, persona] as const
  )
) as Record<string, Persona>

export const personaNames = Object.keys(personasByName)

if (personaNames.length === 0) {
  throw new Error('The model ships no persona to seed simulations from.')
}

export interface PersonaComputation {
  name: string
  situation: Situation<DottedName>
  computedResults: ComputedResults
  actionAssessments: {
    ruleId: string
    applicability: ActionEvaluation
  }[]
}

/**
 * Computed once per persona and kept for the process' lifetime.
 *
 * Evaluating a persona means one engine pass for its footprint plus one
 * evaluation per action rule: doing it once per persona rather than once per
 * simulation is what makes seeding dozens of participants affordable.
 */
const cache = new Map<string, PersonaComputation>()

const computePersona = (
  persona: Persona,
  engine: Engine
): PersonaComputation => {
  engine.setSituation(persona.situation)

  const ruleIdToDottedName = buildRuleIdToDottedName(engine)

  const actionAssessments = [...ruleIdToDottedName.entries()].map(
    ([ruleId, dottedName]) => {
      const evaluation = evaluateAction({
        engine,
        dottedName: dottedName as DottedName,
      })

      return {
        ruleId,
        // A rule whose value cannot be read is left unassessed rather than
        // mis-assessed: "applicability unknown" is the shape that says so.
        applicability:
          evaluation.outcome === 'evaluated'
            ? evaluation.applicability
            : ({ applicable: undefined, impact: undefined } as const),
      }
    }
  )

  return {
    name: persona.nom,
    situation: persona.situation,
    computedResults: getComputedResults(engine),
    actionAssessments,
  }
}

export const getPersonaComputations = (
  names: string[]
): Map<string, PersonaComputation> => {
  const missing = [...new Set(names)].filter((name) => !cache.has(name))

  if (missing.length > 0) {
    const engine = createTestEngine(
      rules as Parameters<typeof createTestEngine>[0]
    ) as unknown as Engine

    for (const name of missing) {
      const persona = personasByName[name]

      if (!persona) {
        throw new Error(`Unknown persona "${name}".`)
      }

      cache.set(name, computePersona(persona, engine))
    }
  }

  return new Map(
    names
      .filter((name) => cache.has(name))
      .map((name) => [name, cache.get(name)!] as const)
  )
}

/**
 * The persona a simulation is answered from, drawn at random — any persona
 * describes a plausible answer, and the point of the demo data is to look like
 * a set of answers rather than to be reproducible.
 *
 * The model only ships a handful of personas, so the same one is naturally
 * drawn several times: its computation is cached, which is what keeps seeding
 * dozens of simulations affordable.
 */
export const pickPersonaName = (): string =>
  faker.helpers.arrayElement(personaNames)

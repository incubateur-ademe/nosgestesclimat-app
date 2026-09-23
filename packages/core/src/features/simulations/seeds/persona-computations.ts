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
}

export interface PersonaActionAssessment {
  ruleId: string
  applicability: ActionEvaluation
}

/**
 * Computed once per persona and kept for the process' lifetime: a simulation is
 * only a copy of its persona's answers, so reading one twice is pure waste.
 */
const computationCache = new Map<string, PersonaComputation>()
const assessmentCache = new Map<string, PersonaActionAssessment[]>()

const readPersona = (name: string): Persona => {
  const persona = personasByName[name]

  if (!persona) {
    throw new Error(`Unknown persona "${name}".`)
  }

  return persona
}

const computePersona = (
  persona: Persona,
  engine: Engine
): PersonaComputation => {
  engine.setSituation(persona.situation, { keepPreviousSituation: false })

  const computedResults = getComputedResults(engine)

  return {
    name: persona.nom,
    situation: persona.situation,
    computedResults,
  }
}

/**
 * How the catalogue's actions apply to a persona's situation.
 */
const computeActionAssessments = (
  persona: Persona,
  engine: Engine
): PersonaActionAssessment[] => {
  engine.setSituation(persona.situation, { keepPreviousSituation: false })

  const ruleIdToDottedName = buildRuleIdToDottedName(engine)

  const assessments = [...ruleIdToDottedName.entries()].map(
    ([ruleId, dottedName]) => {
      const evaluation = evaluateAction({ engine, dottedName })

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

  engine.resetCache()

  return assessments
}

let engine: Engine | undefined

const getEngine = (): Engine => {
  engine ??= createTestEngine(
    rules as Parameters<typeof createTestEngine>[0]
  ) as unknown as Engine

  return engine
}

export const getPersonaComputations = (
  names: string[]
): Map<string, PersonaComputation> => {
  const missing = [...new Set(names)].filter(
    (name) => !computationCache.has(name)
  )

  if (missing.length > 0) {
    const sharedEngine = getEngine()

    for (const name of missing) {
      computationCache.set(
        name,
        computePersona(readPersona(name), sharedEngine)
      )
    }
  }

  return new Map(
    names
      .filter((name) => computationCache.has(name))
      .map((name) => [name, computationCache.get(name)!] as const)
  )
}

/**
 * The action assessments of the given personas, computed on first ask.
 *
 * Called for the simulations an account owns, and only for those.
 */
export const getPersonaActionAssessments = (
  names: string[]
): Map<string, PersonaActionAssessment[]> => {
  const missing = [...new Set(names)].filter(
    (name) => !assessmentCache.has(name)
  )

  if (missing.length > 0) {
    const sharedEngine = getEngine()

    for (const name of missing) {
      assessmentCache.set(
        name,
        computeActionAssessments(readPersona(name), sharedEngine)
      )
    }
  }

  return new Map(
    names
      .filter((name) => assessmentCache.has(name))
      .map((name) => [name, assessmentCache.get(name)!] as const)
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

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

export type PersonaName = keyof typeof personas

export const personaNames = Object.keys(personas) as PersonaName[]

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
const computationCache = new Map<PersonaName, PersonaComputation>()
const assessmentCache = new Map<PersonaName, PersonaActionAssessment[]>()

const readPersona = (name: PersonaName): Persona => personas[name] as Persona

const computePersona = (
  persona: Persona,
  engine: Engine<DottedName>
): PersonaComputation => {
  engine.setSituation(persona.situation)

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
  engine: Engine<DottedName>
): PersonaActionAssessment[] => {
  engine.setSituation(persona.situation)

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

  return assessments
}

let engine: Engine<DottedName> | undefined

const getEngine = (): Engine<DottedName> => {
  engine ??= createTestEngine(
    rules as Parameters<typeof createTestEngine>[0]
  ) as unknown as Engine<DottedName>

  return engine
}

/**
 * The computation of a persona, computed on first ask and kept for the
 * process' lifetime: a simulation is only a copy of its persona's answers, so
 * reading one twice is pure waste.
 */
export const getPersonaComputation = (
  name: PersonaName
): PersonaComputation => {
  const cached = computationCache.get(name)

  if (cached) return cached

  const computation = computePersona(readPersona(name), getEngine())

  computationCache.set(name, computation)

  return computation
}

/**
 * The action assessments of a persona, computed on first ask.
 */
export const getPersonaActionAssessments = (
  name: PersonaName
): PersonaActionAssessment[] => {
  const cached = assessmentCache.get(name)

  if (cached) return cached

  const assessments = computeActionAssessments(readPersona(name), getEngine())

  assessmentCache.set(name, assessments)

  return assessments
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
export const pickPersonaName = (): PersonaName =>
  faker.helpers.arrayElement(personaNames)

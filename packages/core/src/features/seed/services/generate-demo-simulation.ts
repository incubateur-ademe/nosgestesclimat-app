import { faker } from '@faker-js/faker'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import type { PublicodesExpression } from 'publicodes'
import Engine, { utils } from 'publicodes'
import type { Prisma } from '../../../prisma/generated/client.ts'

const carbonMetric = 'carbone' as const
const waterMetric = 'eau' as const
type Metric = 'carbone' | 'eau'

// Single engine reused for every simulation of the seed — the same pattern the
// worker uses, and the reason a single persona situation can be evaluated in
// one setSituation pass. Building an FR engine is heavy (~95MB), so it is
// created lazily on first use and kept for the whole seed run.
const engine = new Engine(rules, {
  logger: {
    log: () => null,
    warn: () => null,
    error: console.error,
  },
})

type RuleName = ReturnType<typeof engine.getParsedRules>

const categories = [
  'transport',
  'alimentation',
  'logement',
  'divers',
  'services sociétaux',
] as const

type Persona = {
  nom: string
  situation: Record<string, unknown>
}

const personasWithSituation = (Object.values(personas) as Persona[]).filter(
  (persona) => Object.keys(persona.situation ?? {}).length > 0
)

const getSubcategories = ({
  dottedName,
  getRule,
  parsedRules,
}: {
  dottedName: string
  getRule: (dottedName: string) => NGCRuleNode | null
  parsedRules: Record<string, NGCRuleNode>
}): DottedName[] => {
  const ruleNode = getRule(dottedName)

  if (!ruleNode || !ruleNode.rawNode) {
    return []
  }

  const dottedNameSomme = ruleNode.rawNode.somme

  const dottedNameFormula = ruleNode.rawNode.formule

  if (
    !dottedNameSomme &&
    (!dottedNameFormula ||
      typeof dottedNameFormula !== 'object' ||
      !('somme' in dottedNameFormula) ||
      !Array.isArray(dottedNameFormula.somme))
  ) {
    return []
  }

  const sommeArray = Array.isArray(dottedNameSomme)
    ? dottedNameSomme
    : typeof dottedNameFormula === 'object' &&
        Array.isArray(dottedNameFormula.somme)
      ? dottedNameFormula.somme
      : []

  return (
    sommeArray.map(
      (potentialPartialRuleName: DottedName) =>
        utils.disambiguateReference(
          parsedRules,
          dottedName,
          potentialPartialRuleName
        ) as DottedName
    ) || []
  )
}

const evaluate = ({
  expr,
  metric,
}: {
  expr: PublicodesExpression
  metric: Metric
}): number | undefined => {
  const value = engine.evaluate({
    valeur: expr,
    contexte: {
      métrique: `'${metric}'`,
    },
  }).nodeValue

  return typeof value === 'number'
    ? +value.toFixed(4)
    : value
      ? +value
      : undefined
}

const computeMetricResults = (metric: Metric, parsedRules: RuleName) => ({
  bilan: evaluate({ expr: 'bilan', metric }) ?? 0,
  categories: Object.fromEntries(
    categories.map((category) => [
      category,
      evaluate({ expr: category, metric }) ?? 0,
    ])
  ) as Record<(typeof categories)[number], number>,
  subcategories: Object.fromEntries(
    categories.flatMap((category) =>
      getSubcategories({
        dottedName: category,
        // @ts-expect-error categories are not rules
        getRule: (dottedName) => engine.getRule(dottedName),
        parsedRules,
      }).map((subcategory) => [
        subcategory,
        evaluate({ expr: subcategory, metric }) ?? 0,
      ])
    )
  ),
})

/**
 * Returns a realistic situation + computedResults pair for a random persona,
 * so poll statistics (funFacts, computedResults aggregation) compute real
 * values instead of empty ones. The situation is valid for SituationSchema and
 * the computedResults match ComputedResultSchema.
 */
export const generateDemoSimulationData = (): {
  situation: Prisma.InputJsonValue
  computedResults: Prisma.InputJsonValue
} => {
  const persona = faker.helpers.arrayElement(personasWithSituation)
  const situation = persona.situation

  engine.setSituation(situation)

  const parsedRules = engine.getParsedRules()

  return {
    situation: situation as Prisma.InputJsonValue,
    computedResults: {
      carbone: computeMetricResults(carbonMetric, parsedRules),
      eau: computeMetricResults(waterMetric, parsedRules),
    },
  }
}

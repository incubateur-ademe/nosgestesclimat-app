import { faker } from '@faker-js/faker'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import modelPackage from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import {
  SituationSchema,
  type Situation,
} from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import type { PublicodesExpression } from 'publicodes'
import Engine, { utils } from 'publicodes'
import * as v from 'valibot'
import { carbonMetric, waterMetric } from '../../simulation.constant.ts'

import type { Metric } from '../../../../types/types.ts'
import { type SimulationParticipantCreateInputDto } from '../../simulations.validator.ts'

export const DELETE_SIMULATION_ROUTE = '/simulations/v1/:simulationId'

const defaultModelVersion = modelPackage.version
  .match(/^(\d+\.\d+\.\d+)/)!
  .pop()

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

  // TO FIX: Sometimes the `somme` isn't in the formula.
  if (
    !dottedNameSomme && // No `somme` directly in the rule
    (!dottedNameFormula ||
      typeof dottedNameFormula !== 'object' ||
      !('somme' in dottedNameFormula) ||
      !Array.isArray(dottedNameFormula.somme)) // No `somme` in the formula or invalid format
  ) {
    return []
  }

  // TODO: Remove this check when the `somme` is always in the formula
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

const getComputedResults = (situation: Situation) => {
  engine.setSituation(situation)

  const parsedRules = engine.getParsedRules()

  return {
    carbone: computeMetricResults(carbonMetric, parsedRules),
    eau: computeMetricResults(waterMetric, parsedRules),
  }
}

const getRandomPersona = () =>
  personas[
    faker.helpers.arrayElement(Object.keys(personas)) as keyof typeof personas
  ]

export const getRandomPersonaSituation = () => getRandomPersona().situation

export const getRandomTestCase = () => {
  const { nom, situation } = getRandomPersona()

  return {
    computedResults: getComputedResults(situation),
    situation,
    nom,
  }
}

export const getSimulationPayload = ({
  id,
  date,
  model,
  situation,
  foldedSteps,
  progression,
  computedResults,
  additionalQuestionsAnswers,
}: Partial<SimulationParticipantCreateInputDto> = {}): SimulationParticipantCreateInputDto => {
  situation = situation || getRandomPersonaSituation()
  computedResults =
    computedResults || getComputedResults(v.parse(SituationSchema, situation))
  model = model || `FR-fr-${defaultModelVersion}`

  return {
    id: id || faker.string.uuid(),
    date,
    model,
    situation,
    foldedSteps,
    progression: progression || 1,
    computedResults,
    additionalQuestionsAnswers,
  }
}

export const createSimulation = async ({
  userId,
  email,
  simulation = {},
}: {
  userId?: string
  email?: string
  simulation?: Partial<SimulationParticipantCreateInputDto>
}) => {
  userId = userId ?? faker.string.uuid()
  const payload = getSimulationPayload(simulation)

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  })

  const createdSimulation = await prisma.simulation.create({
    data: {
      id: payload.id,
      model: payload.model,
      date: (payload.date ?? new Date()) as Date,
      situation: payload.situation as never,
      foldedSteps: (payload.foldedSteps ?? []) as never,
      progression: payload.progression,
      computedResults: payload.computedResults as never,
      user: { connect: { id: userId } },
      ...(email ? { verifiedUser: { connect: { email } } } : {}),
    },
  })

  return {
    id: createdSimulation.id,
    user: { id: userId },
  }
}

import { faker } from '@faker-js/faker'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import modelPackage from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import { StatusCodes } from 'http-status-codes'
import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import type { PublicodesExpression } from 'publicodes'
import Engine, { utils } from 'publicodes'
import type supertest from 'supertest'
import { carbonMetric, waterMetric } from '../../simulation.constant.js'

import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../../core/event-bus/event-bus.js'
import type { Metric } from '../../../../types/types.js'
import { COOKIE_NAME } from '../../../authentication/authentication.service.js'
import type {
  ExtendedSituationSchema,
  SimulationCreateInputDto,
  SimulationParticipantCreateInputDto,
} from '../../simulations.validator.js'
import { SituationSchema } from '../../simulations.validator.js'

type TestAgent = ReturnType<typeof supertest>

export const CREATE_SIMULATION_ROUTE = '/simulations/v1/:userId'

export const FETCH_USER_SIMULATIONS_ROUTE = '/simulations/v1/:userId'

export const FETCH_USER_SIMULATION_ROUTE =
  '/simulations/v1/:userId/:simulationId'

export const DELETE_SIMULATION_ROUTE = '/simulations/v1/:userId/:simulationId'

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

const getComputedResults = (situation: SituationSchema) => {
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
  const { nom, situation, extendedSituation } = getRandomPersona()

  return {
    computedResults: getComputedResults(situation),
    extendedSituation: extendedSituation as ExtendedSituationSchema,
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
  actionChoices,
  computedResults,
  additionalQuestionsAnswers,
}: Partial<SimulationParticipantCreateInputDto> = {}): SimulationParticipantCreateInputDto => {
  situation = situation || getRandomPersonaSituation()
  computedResults =
    computedResults || getComputedResults(SituationSchema.parse(situation))
  model = model || `FR-fr-${defaultModelVersion}`

  return {
    id: id || faker.string.uuid(),
    date,
    model,
    situation,
    foldedSteps,
    progression: progression || 1,
    actionChoices,
    computedResults,
    additionalQuestionsAnswers,
  }
}

export const createSimulation = async ({
  agent,
  userId,
  cookie,
  simulation = {},
}:
  | {
      agent: TestAgent
      userId?: string
      simulation?: Partial<SimulationCreateInputDto>
      cookie?: undefined
    }
  | {
      agent: TestAgent
      userId?: undefined
      simulation?: Partial<SimulationCreateInputDto>
      cookie?: string
    }) => {
  if (cookie) {
    ;({ userId } = jwt.decode(
      cookie.split(';').shift()!.replace(`${COOKIE_NAME}=`, '')!
    ) as JwtPayload)
  }

  userId = userId ?? faker.string.uuid()
  const { user } = simulation
  const payload: SimulationCreateInputDto = {
    ...getSimulationPayload(simulation),
    user,
  }

  if (payload.user?.email || cookie) {
    mswServer.use(
      brevoUpdateContact(),
      brevoRemoveFromList(22, { invalid: true }),
      brevoRemoveFromList(32, { invalid: true }),
      brevoRemoveFromList(36, { invalid: true }),
      brevoRemoveFromList(40, { invalid: true }),
      brevoRemoveFromList(41, { invalid: true }),
      brevoRemoveFromList(42, { invalid: true })
    )
  }

  const request = agent.post(CREATE_SIMULATION_ROUTE.replace(':userId', userId))

  if (cookie) {
    request.set('cookie', cookie)
  }

  const response = await request.send(payload).expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

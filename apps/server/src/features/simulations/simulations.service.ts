import type {
  DottedName,
  FunFacts,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import modelRules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
import dayjs from 'dayjs'
import type Engine from 'publicodes'
import * as v from 'valibot'
import type { JsonValue, Prisma } from '../../adapters/prisma/generated.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { redis } from '../../adapters/redis/client.ts'
import { KEYS } from '../../adapters/redis/constant.ts'
import { deepMergeSum } from '../../core/deep-merge.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import type { Locales } from '../../core/i18n/constant.ts'
import { isVerifiedUser } from '../../core/typeguards/isVerifiedUser.ts'
import type { PartialUser } from '../../core/types/user.ts'

import {
  defaultUserSelection,
  defaultVerifiedUserSelection,
  simulationSelection,
} from '../../adapters/prisma/selection.ts'
import { PollUpdatedEvent } from '../organisations/events/PollUpdated.event.ts'
import type {
  OrganisationPollCustomAdditionalQuestion,
  PublicPollParams,
} from '../organisations/organisations.validator.ts'
import {
  createOrUpdateUser,
  fetchUser,
  fetchVerifiedUser,
} from '../users/users.repository.ts'
import type { SimulationAsyncEvent } from './events/SimulationUpserted.event.ts'
import { SimulationUpsertedEvent } from './events/SimulationUpserted.event.ts'
import { carbonMetric, waterMetric } from './simulation.constant.ts'
import {
  batchPollSimulations,
  createParticipantSimulation,
  createPollUserSimulation,
  fetchSimulationById,
  fetchUserSimulations,
  softDeleteSimulation as softDeleteSimulationFunc,
} from './simulations.repository.ts'
import type {
  SimulationCreateDto,
  SimulationCreateQuery,
  SimulationParams,
  SimulationsFetchQuery,
} from './simulations.validator.ts'
import {
  ComputedResultSchema,
  SituationSchema,
} from './simulations.validator.ts'
import {
  getSituationDottedNameValue,
  getSituationDottedNameValueWithEngine,
} from './situation/situation.service.ts'

const frRules = modelRules as Partial<NGCRules>
const funFactsRules = modelFunFacts as { [k in keyof FunFacts]: DottedName }

/**
 * Transforms a simulation entity to a DTO format.
 * If the simulation user is not the connected user, sensitive fields are hidden
 * and only the name is returned for privacy purposes.
 *
 * @param simulation - The simulation entity with user, verifiedUser, and polls data
 * @param connectedUser - The identifier of the connected user (email for verified users, id for unverified users)
 * @returns The simulation DTO with user data filtered based on ownership
 */
const simulationToDto = (
  {
    verifiedUser,
    polls,
    user,
    groups,
    ...rest
  }: Partial<
    Prisma.SimulationGetPayload<{ select: typeof simulationSelection }>
  >,
  connectedUser: PartialUser
) => ({
  ...rest,
  groups: groups?.map(({ groupId }) => ({ id: groupId })),
  polls: polls?.map(({ pollId, poll: { slug, name } }) => ({
    id: pollId,
    slug,
    name,
  })),
  ...(user
    ? { user: user.id === connectedUser.id ? user : { name: user.name } }
    : {}),
  ...(verifiedUser
    ? {
        user:
          isVerifiedUser(connectedUser) &&
          verifiedUser.email === connectedUser.email
            ? verifiedUser
            : { name: verifiedUser.name },
      }
    : {}),
})

export const createSimulation = async ({
  simulationDto,
  query,
  origin,
  user,
}: {
  simulationDto: SimulationCreateDto
  query: SimulationCreateQuery
  origin: string
  user: PartialUser
}) => {
  const verifiedUser = isVerifiedUser(user) ? user : undefined

  let fullUser
  // Case 1. The user is authentified
  if (verifiedUser) {
    fullUser = await transaction((session) =>
      fetchUser(
        {
          id: user.id,
          select: defaultUserSelection,
        },
        { session }
      )
    )
  }

  // Case 2. Not authentified: upsert the unverified user account by its id
  if (!fullUser) {
    ;({ user: fullUser } = await transaction((session) =>
      createOrUpdateUser(
        {
          id: user.id,
          user: {},
          select: defaultUserSelection,
        },
        { session }
      )
    ))
  }

  const {
    simulation,
    created: simulationCreated,
    updated: simulationUpdated,
  } = await transaction((session) =>
    createParticipantSimulation(
      {
        userId: user.id,
        email: verifiedUser?.email,
        simulation: simulationDto,
        select: simulationSelection,
      },
      { session }
    )
  )

  const simulationUpsertedEvent = new SimulationUpsertedEvent({
    created: simulationCreated,
    updated: simulationUpdated,
    user: fullUser ?? {
      id: user.id,
      email: verifiedUser ? verifiedUser.email : null,
      name: null,
    },
    verified: isVerifiedUser(user),
    newsletters: query.newsletters,
    simulation,
    sendEmail: query.sendEmail,
    locale: query.locale,
    origin,
  })

  EventBus.emit(simulationUpsertedEvent)
  await EventBus.once(simulationUpsertedEvent)
  return {
    simulation: simulationToDto(simulation, user),
  }
}

export const fetchSimulations = async ({
  query,
  user,
}: {
  query: SimulationsFetchQuery
  user: PartialUser
}) => {
  const { simulations, count } = await transaction(
    (session) => fetchUserSimulations({ userId: user.id }, { session, query }),
    prisma
  )

  return {
    simulations: simulations.map((s) => simulationToDto(s, user)),
    count,
  }
}

export const fetchSimulation = async ({
  params,
  user,
}: {
  params: SimulationParams
  user: PartialUser
}) => {
  try {
    const simulation = await transaction(
      (session) => fetchSimulationById(params, { session }),
      prisma
    )

    if (!simulation.user || simulation.user.id !== user.id) {
      throw new EntityNotFoundException('Simulation not found')
    }

    return simulationToDto(simulation, user)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Simulation not found')
    }
    throw e
  }
}

export const softDeleteSimulation = async ({
  params,
  user,
}: {
  params: SimulationParams
  user: PartialUser
}) => {
  const simulation = await transaction(
    (session) =>
      softDeleteSimulationFunc(
        { simulationId: params.simulationId, userId: user.id },
        { session }
      ),
    prisma
  )

  if (!simulation) {
    throw new EntityNotFoundException('Simulation not found')
  }
}

export const createPollSimulation = async ({
  locale,
  origin,
  params,
  simulationDto,
  user: requestUser,
}: {
  origin: string
  locale: Locales
  params: PublicPollParams
  simulationDto: SimulationCreateDto
  user: PartialUser
}) => {
  try {
    let user
    const verifiedUser = isVerifiedUser(requestUser)
      ? { id: requestUser.id, email: requestUser.email }
      : undefined
    // Case 1. The user is authentified
    if (verifiedUser) {
      const email = verifiedUser.email
      user = await transaction((session) =>
        fetchVerifiedUser(
          {
            email,
            select: defaultVerifiedUserSelection,
          },
          { session }
        )
      )
    }

    // Case 2. Not authentified
    if (!user) {
      const unverifiedUser = await transaction((session) =>
        createOrUpdateUser(
          {
            id: requestUser.id,
            user: {},
            select: defaultUserSelection,
          },
          { session }
        )
      )
      user = {
        ...unverifiedUser.user,
        ...unverifiedUser,
      }
    }

    const { poll, simulation, created, updated, isNewParticipation } =
      await transaction((session) =>
        createPollUserSimulation(
          { ...params, id: requestUser.id, ...verifiedUser },
          simulationDto,
          {
            session,
          }
        )
      )
    const { organisation } = poll

    const simulationUpsertedEvent = new SimulationUpsertedEvent({
      user,
      sendEmail: isNewParticipation,
      organisation,
      simulation,
      created,
      updated,
      locale,
      origin,
      poll,
    })

    const pollUpdatedEvent = new PollUpdatedEvent({
      poll,
      organisation,
    })

    EventBus.emit(simulationUpsertedEvent).emit(pollUpdatedEvent)

    // @ts-expect-error 2 events different types: TODO fix
    await EventBus.once(simulationUpsertedEvent, pollUpdatedEvent)

    return simulationToDto(simulation, requestUser)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

const MAX_VALUE = 100000

const isValidSimulation = <T>(
  simulation: T &
    (
      | {
          progression: number
          computedResults: JsonValue
          situation: JsonValue
        }
      | SimulationAsyncEvent
    )
): simulation is T & {
  progression: number
  computedResults: ComputedResultSchema
  situation: SituationSchema
} => {
  if (simulation.progression !== 1) {
    return false
  }

  const computedResults = v.safeParse(
    ComputedResultSchema,
    simulation.computedResults
  )

  const situation = v.safeParse(SituationSchema, simulation.situation)

  if (computedResults.issues || situation.issues) {
    return false
  }

  return [
    computedResults.output.carbone.bilan,
    ...Object.values(computedResults.output.carbone.categories),
  ].every((v) => v <= MAX_VALUE)
}

const getEmptyComputedResults = (): ComputedResultSchema => ({
  carbone: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
  eau: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
})

const mergeComputedResults = (
  computedResults1: ComputedResultSchema,
  computedResults2: ComputedResultSchema
) => {
  return deepMergeSum(
    computedResults1,
    computedResults2
  ) as ComputedResultSchema
}

const computeAllStatValues = async (
  { id, engine }: { id: string; engine?: Engine },
  { session }: { session: Session }
) => {
  let simulationCount = 0
  let computedResults = getEmptyComputedResults()
  const funFactValues: { [key in DottedName]?: number } = {}
  for await (const { simulation } of batchPollSimulations(
    { id },
    { session }
  )) {
    if (!isValidSimulation(simulation)) {
      continue
    }
    simulationCount++

    const { situation } = simulation

    computedResults = mergeComputedResults(
      computedResults,
      simulation.computedResults
    )

    Object.values(funFactsRules).reduce((acc, dottedName) => {
      if (dottedName in frRules) {
        acc[dottedName] =
          (acc[dottedName] || 0) +
          (engine
            ? getSituationDottedNameValueWithEngine({
                dottedName,
                situation,
                engine,
              })
            : getSituationDottedNameValue({
                dottedName,
                situation,
                rules: frRules,
              }))
      }
      return acc
    }, funFactValues)
  }

  return { simulationCount, funFactValues, computedResults }
}

type RedisPollFunFactsCache = {
  simulationCount: number
  funFactValues: { [key in DottedName]?: number }
  computedResults: ComputedResultSchema
}

const getStatValues = async (
  {
    id,
    simulation,
    engine,
  }: { id: string; simulation?: SimulationAsyncEvent; engine?: Engine },
  { session }: { session: Session }
) => {
  const redisKey = `${KEYS.pollsStatsResults}:${id}`

  let result: RedisPollFunFactsCache | undefined
  if (simulation) {
    const rawPreviousFunFactValues = await redis.get(redisKey)
    if (rawPreviousFunFactValues) {
      result = JSON.parse(rawPreviousFunFactValues) as RedisPollFunFactsCache

      if (isValidSimulation(simulation)) {
        const { situation } = simulation

        result.computedResults = mergeComputedResults(
          result.computedResults,
          simulation.computedResults
        )

        result.simulationCount++
        Object.values(funFactsRules).reduce((acc, dottedName) => {
          if (dottedName in frRules) {
            acc[dottedName] =
              (acc[dottedName] || 0) +
              (engine
                ? getSituationDottedNameValueWithEngine({
                    dottedName,
                    situation,
                    engine,
                  })
                : getSituationDottedNameValue({
                    dottedName,
                    situation,
                    rules: frRules,
                  }))
          }
          return acc
        }, result.funFactValues)
      }
    }
  }

  if (!result) {
    result = await computeAllStatValues({ id, engine }, { session })
  }

  await redis.set(redisKey, JSON.stringify(result))
  await redis.expire(redisKey, 60 * 60)

  return result
}

export const getPollStats = async (
  params: { id: string; simulation?: SimulationAsyncEvent; engine?: Engine },
  session: { session: Session }
) => {
  const { computedResults, funFactValues, simulationCount } =
    await getStatValues(params, session)

  return {
    computedResults,
    funFacts: Object.fromEntries(
      Object.entries(funFactsRules).map(([key, dottedName]) => {
        let value = funFactValues[dottedName] || 0

        if (key.startsWith('average')) {
          value = value / simulationCount
        }

        if (key.startsWith('percentage')) {
          value = (value / simulationCount) * 100
        }

        return [key, value]
      })
    ) as FunFacts,
  }
}

const EXCEL_ERROR = '#####'

export const getPollSimulationsExcelData = async (
  {
    id,
    customAdditionalQuestions,
  }: {
    id: string
    customAdditionalQuestions: OrganisationPollCustomAdditionalQuestion[]
  },
  session: { session: Session }
) => {
  const data = []

  for await (const { simulation } of batchPollSimulations(
    {
      id,
      batchSize: 1000,
      select: {
        date: true,
        computedResults: true,
        progression: true,
        additionalQuestionsAnswers: {
          select: {
            key: true,
            answer: true,
          },
        },
      },
    },
    session
  )) {
    if (simulation.progression !== 1) {
      continue
    }
    const computedResults = v.safeParse(
      ComputedResultSchema,
      simulation.computedResults
    )

    const line = {}

    if (computedResults.issues) {
      Object.assign(line, {
        date: dayjs(simulation.date).format('DD/MM/YYYY'),
        'total carbone': EXCEL_ERROR,
        'transport carbone': EXCEL_ERROR,
        'alimentation carbone': EXCEL_ERROR,
        'logement carbone': EXCEL_ERROR,
        'divers carbone': EXCEL_ERROR,
        'services sociétaux carbone': EXCEL_ERROR,
        'total eau': EXCEL_ERROR,
        'transport eau': EXCEL_ERROR,
        'alimentation eau': EXCEL_ERROR,
        'logement eau': EXCEL_ERROR,
        'divers eau': EXCEL_ERROR,
        'services sociétaux eau': EXCEL_ERROR,
      })
    } else {
      const carbon = computedResults.output[carbonMetric]
      const water = computedResults.output[waterMetric]
      Object.assign(line, {
        date: dayjs(simulation.date).format('DD/MM/YYYY'),
        'total carbone': Math.round(carbon.bilan),
        'transport carbone': Math.round(carbon.categories.transport),
        'alimentation carbone': Math.round(carbon.categories.alimentation),
        'logement carbone': Math.round(carbon.categories.logement),
        'divers carbone': Math.round(carbon.categories.divers),
        'services sociétaux carbone': Math.round(
          carbon.categories['services sociétaux']
        ),
        'total eau': Math.round(water.bilan),
        'transport eau': Math.round(water.categories.transport),
        'alimentation eau': Math.round(water.categories.alimentation),
        'logement eau': Math.round(water.categories.logement),
        'divers caeau': Math.round(water.categories.divers),
        'services sociétaux eau': Math.round(
          water.categories['services sociétaux']
        ),
      })
    }

    customAdditionalQuestions.forEach(({ question }) =>
      Object.assign(line, {
        [question]:
          simulation.additionalQuestionsAnswers.find(
            ({ key }) => key === question
          )?.answer ?? '',
      })
    )

    data.push(line)
  }

  return data
}

import { hasValidComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
import dayjs from 'dayjs'
import * as v from 'valibot'
import type { Prisma } from '../../adapters/prisma/generated.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { UnauthorizedException } from '../../core/errors/UnauthorizedException.ts'
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
  fetchVerifiedUser,
} from '../users/users.repository.ts'
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
import { ComputedResultSchema } from './simulations.validator.ts'

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
  user,
}: {
  simulationDto: SimulationCreateDto
  query: SimulationCreateQuery
  user: PartialUser
}) => {
  const verifiedUser = isVerifiedUser(user) ? user : undefined

  let fullUser
  // Case 1. The user is authentified
  if (verifiedUser) {
    const dbVerifiedUser = await fetchVerifiedUser(
      {
        email: verifiedUser.email,
        select: defaultVerifiedUserSelection,
      },
      { session: prisma }
    )

    if (!dbVerifiedUser || dbVerifiedUser.id !== user.id) {
      throw new UnauthorizedException()
    }

    fullUser = dbVerifiedUser
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
    simulations: simulations
      .map((s) => simulationToDto(s, user))
      .filter(hasValidComputedResults),
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

    if (
      !simulation.user ||
      simulation.user.id !== user.id ||
      !hasValidComputedResults(simulation)
    ) {
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
  params,
  simulationDto,
  user: requestUser,
}: {
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
      user = await fetchVerifiedUser(
        {
          email,
          select: defaultVerifiedUserSelection,
        },
        { session: prisma }
      )

      if (!user || user.id !== verifiedUser.id) {
        throw new UnauthorizedException()
      }
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

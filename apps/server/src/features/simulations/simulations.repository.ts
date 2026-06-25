import type { Prisma } from '../../adapters/prisma/generated.ts'
import {
  defaultOrganisationSelectionWithoutPolls,
  defaultPollSelection,
  simulationSelection,
  simulationSelectionWithPolls,
} from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { batchFindMany } from '../../core/batch-find-many.ts'
import { ImmutableSimulationException } from '../../core/errors/ImmutableSimulationException.ts'
import type { PartialUser } from '../../core/types/user.ts'

import type { PublicPollParams } from '../organisations/organisations.validator.ts'
import type {
  SimulationCreateDto,
  SimulationParticipantCreateDto,
  SimulationsFetchQuery,
} from './simulations.validator.ts'

export const createParticipantSimulation = async <
  T extends Prisma.SimulationSelect = typeof simulationSelectionWithPolls,
>(
  {
    email,
    userId,
    simulation: {
      id,
      actionChoices,
      computedResults,
      date,
      model,
      foldedSteps,
      progression,
      situation,
      extendedSituation,
      additionalQuestionsAnswers,
    },
    select = simulationSelectionWithPolls as T,
  }: {
    email?: string
    userId: string
    simulation: SimulationParticipantCreateDto
    select?: T
  },
  { session }: { session: Session }
) => {
  const existingSimulation = await session.simulation.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      progression: true,
    },
  })

  if (existingSimulation?.progression === 1 && progression !== 1) {
    throw new ImmutableSimulationException()
  }

  const payload: Omit<Prisma.SimulationCreateInput, 'id'> = {
    date,
    model,
    user: {
      connect: {
        id: userId,
      },
    },
    ...(email
      ? {
          verifiedUser: {
            connect: {
              email,
            },
          },
        }
      : {}),
    situation,
    foldedSteps,
    progression,
    actionChoices,
    computedResults,
    extendedSituation,
    states: {
      create: {
        date: new Date(),
        progression,
      },
    },
    ...(additionalQuestionsAnswers?.length
      ? {
          additionalQuestionsAnswers: {
            ...(existingSimulation
              ? {
                  deleteMany: {
                    simulationId: id,
                  },
                }
              : {}),
            createMany: {
              data: additionalQuestionsAnswers.map(({ type, key, answer }) => ({
                type,
                key,
                answer,
              })),
            },
          },
        }
      : {}),
  }

  const simulation = existingSimulation
    ? await session.simulation.update({
        where: {
          id,
        },
        data: {
          ...payload,
        },
        select,
      })
    : await session.simulation.create({
        data: {
          id,
          ...payload,
        },
        select,
      })

  return {
    simulation,
    created: !existingSimulation,
    updated: !!existingSimulation,
  }
}

export const fetchUserSimulations = async (
  { userId }: { userId: string },
  {
    session,
    query: { pageSize, page, completedOnly },
  }: { session: Session; query: SimulationsFetchQuery }
) => {
  const where = {
    ...{ userId },
    progression: completedOnly ? 1 : undefined,
  }

  const [simulations, count] = await Promise.all([
    session.simulation.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      select: simulationSelection,
      orderBy: {
        date: 'desc',
      },
    }),
    session.simulation.count({ where }),
  ])

  return {
    simulations,
    count,
  }
}

export const fetchSimulationById = (
  { simulationId }: { simulationId: string },
  { session }: { session: Session }
) => {
  return session.simulation.findUniqueOrThrow({
    where: {
      id: simulationId,
    },
    select: simulationSelection,
  })
}

export const createPollUserSimulation = async (
  params: PublicPollParams & PartialUser,
  simulationDto: SimulationCreateDto,
  { session }: { session: Session }
) => {
  const { id, pollIdOrSlug } = params
  const email =
    ('email' in params ? params.email : undefined) ?? simulationDto.user?.email
  const { id: pollId } = await session.poll.findFirstOrThrow({
    where: {
      OR: [{ id: pollIdOrSlug }, { slug: pollIdOrSlug }],
    },
    select: {
      id: true,
    },
  })

  const existingParticipation = await session.simulationPoll.findFirst({
    where: {
      pollId,
      simulation: {
        user: email ? { email } : { id },
      },
    },
    select: { id: true },
  })

  const {
    simulation: { id: simulationId },
    created: simulationCreated,
    updated: simulationUpdated,
  } = await createParticipantSimulation(
    {
      userId: id,
      email,
      simulation: simulationDto,
      select: simulationSelection,
    },
    { session }
  )

  const relation = {
    pollId,
    simulationId,
  }

  const { simulation, poll } = await session.simulationPoll.upsert({
    where: {
      simulationId_pollId: relation,
    },
    create: relation,
    update: {},
    select: {
      simulation: {
        select: simulationSelection,
      },
      poll: {
        select: {
          ...defaultPollSelection,
          organisation: {
            select: defaultOrganisationSelectionWithoutPolls,
          },
        },
      },
    },
  })

  return {
    poll,
    simulation,
    created: simulationCreated,
    updated: simulationUpdated,
    isNewParticipation: !existingParticipation,
  }
}

export const batchPollSimulations = <
  T extends Prisma.SimulationSelect = typeof simulationSelectionWithPolls,
>(
  {
    id,
    batchSize = 100,
    select = simulationSelection as T,
  }: {
    id: string
    batchSize?: number
    select?: T
  },
  { session }: { session: Session }
) => {
  return batchFindMany(
    (params) =>
      session.simulationPoll.findMany({
        ...params,
        where: { pollId: id },
        select: {
          id: true,
          simulation: {
            select,
          },
        },
      }),
    { batchSize }
  )
}

export const softDeleteSimulation = async (
  { simulationId, userId }: { simulationId: string; userId: string },
  { session }: { session: Session }
) => {
  const simulation = await session.simulation.findUnique({
    where: { id: simulationId, userId },
    select: { id: true, userId: true },
  })

  if (!simulation) {
    return null
  }

  await session.groupParticipant.deleteMany({
    where: {
      simulationId,
      userId,
    },
  })

  const result = await session.simulation.update({
    where: {
      id: simulationId,
    },
    data: {
      userId: null,
    },
    select: simulationSelection,
  })

  return result
}

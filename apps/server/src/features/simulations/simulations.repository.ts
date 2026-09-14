import type { Prisma } from '../../adapters/prisma/generated.ts'
import {
  simulationSelection,
  simulationSelectionWithPolls,
} from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { batchFindMany } from '../../core/batch-find-many.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { ImmutableSimulationException } from '../../core/errors/ImmutableSimulationException.ts'
import type { SimulationParticipantCreateDto } from './simulations.validator.ts'

export const createParticipantSimulation = async <
  T extends Prisma.SimulationSelect = typeof simulationSelectionWithPolls,
>(
  {
    email,
    userId,
    simulation: {
      id,
      computedResults,
      date,
      model,
      foldedSteps,
      progression,
      situation,
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
      userId: true,
    },
  })

  if (existingSimulation && existingSimulation.userId !== userId) {
    throw new ForbiddenException('Simulation does not belong to the user')
  }

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
    computedResults,
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

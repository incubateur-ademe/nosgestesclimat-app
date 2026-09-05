import type { JsonValue } from '@prisma/client/runtime/client'
import { prisma } from '../../../prisma/client.ts'
import type {
  PollDefaultAdditionalQuestionType,
  PollMode,
} from '../../../prisma/generated/client.ts'
import type { Poll } from '../types/poll.ts'
import { toPoll } from './poll.mapper.ts'

export interface PollRow {
  id: string
  name: string
  slug: string
  mode: PollMode
  organisationId: string
  expectedNumberOfParticipants: number | null
  funFacts: JsonValue | null
  computedResults: unknown
  customAdditionalQuestions: unknown
  defaultAdditionalQuestions: { type: PollDefaultAdditionalQuestionType }[]
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

const pollSelect = {
  id: true,
  name: true,
  slug: true,
  mode: true,
  organisationId: true,
  expectedNumberOfParticipants: true,
  funFacts: true,
  computedResults: true,
  customAdditionalQuestions: true,
  defaultAdditionalQuestions: {
    select: { type: true },
  },
  createdAt: true,
  updatedAt: true,
  organisation: {
    select: { id: true, name: true, slug: true },
  },
} as const

export const findPollsBySimulationId = async ({
  simulationId,
}: {
  simulationId: string
}): Promise<Poll[]> => {
  const rows = await prisma.simulationPoll.findMany({
    where: { simulationId },
    // Oldest first: the last entry is the poll the user most recently joined.
    orderBy: { createdAt: 'asc' },
    select: { poll: { select: pollSelect } },
  })

  return rows.map(({ poll }) => toPoll(poll))
}

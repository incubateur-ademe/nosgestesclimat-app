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

export const findPollById = async (id: string): Promise<Poll | null> => {
  const row = await prisma.poll.findUnique({
    where: { id },
    select: pollSelect,
  })

  return row ? toPoll(row) : null
}

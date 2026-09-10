import { isCuid } from '../../../lib/cuid.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Poll, PollSummary } from '../types/poll.ts'
import { toPoll } from './poll.mapper.ts'

const pollSelect = {
  id: true,
  name: true,
  slug: true,
  mode: true,
  organisationId: true,
  expectedNumberOfParticipants: true,
  funFacts: true,
  computedResults: true,
  createdAt: true,
  updatedAt: true,
  organisation: {
    select: { id: true, name: true, slug: true },
  },
} as const

const pollSummarySelect = {
  id: true,
  name: true,
  slug: true,
  organisation: { select: { slug: true } },
} as const

export const findPollById = async (id: string): Promise<Poll | null> => {
  const row = await prisma.poll.findUnique({
    where: { id },
    select: pollSelect,
  })
  return row ? toPoll(row) : null
}

export const findPollByIdOrSlug = async ({
  pollIdOrSlug,
}: {
  pollIdOrSlug: string
}): Promise<Poll | null> => {
  const row = await prisma.poll.findUnique({
    where: isCuid(pollIdOrSlug) ? { id: pollIdOrSlug } : { slug: pollIdOrSlug },
    select: pollSelect,
  })

  return row ? toPoll(row) : null
}

export const findPollSummaryById = async ({
  id,
}: {
  id: string
}): Promise<PollSummary | null> => {
  return prisma.poll.findUnique({
    where: { id },
    select: pollSummarySelect,
  })
}

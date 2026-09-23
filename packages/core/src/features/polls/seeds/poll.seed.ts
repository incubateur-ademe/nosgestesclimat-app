import type { PollMode } from '../../../prisma/generated/client.ts'
import { createPollParticipation } from '../repositories/poll-participation.repository.ts'
import { createPoll } from '../repositories/poll.repository.ts'
import type { Poll } from '../types/poll.ts'

export interface PollSeedShape {
  name: string
  slug: string
  mode: PollMode
  participantsCount: number
}

export const defaultPollSeedShapes: PollSeedShape[] = [
  {
    name: 'Campagne de démonstration',
    slug: 'campagne-demonstration',
    mode: 'standard',
    participantsCount: 2,
  },
  {
    name: 'Campagne avec 60 réponses',
    slug: 'campagne-60-reponses',
    mode: 'standard',
    participantsCount: 60,
  },
]

/** The slug a campaign is stored under, derived from its organisation as poll slugs must be unique. In production, already existing slugs are incremented with a number. */
export const pollSlug = ({
  organisationSlug,
  shape,
}: {
  organisationSlug: string
  shape: PollSeedShape
}): string => `${organisationSlug}-${shape.slug}`

/**
 * Creates a poll and attaches the participants it is given.
 */
export const seedPoll = async ({
  organisationId,
  slug,
  shape,
  simulationIds,
}: {
  organisationId: string
  slug: string
  shape: PollSeedShape
  simulationIds: string[]
}): Promise<Poll> => {
  const poll = await createPoll({
    name: shape.name,
    slug,
    organisationId,
    mode: shape.mode,
  })

  for (const simulationId of simulationIds) {
    await createPollParticipation({ pollId: poll.id, simulationId })
  }

  return poll
}

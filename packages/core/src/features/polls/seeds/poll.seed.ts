import type {
  Organisation,
  PollMode,
} from '../../../prisma/generated/client.ts'
import { seedSimulations } from '../../simulations/seeds/simulations.seed.ts'
import { pollFactory } from '../factories/poll.factory.ts'
import type { Poll } from '../types/poll.ts'

export interface PollSeedShape {
  name: string
  mode: PollMode
  participantsCount: number
}

export const defaultPollSeedShapes: PollSeedShape[] = [
  {
    name: 'Campagne de démonstration',
    mode: 'standard',
    participantsCount: 2,
  },
  {
    name: 'Campagne avec 60 réponses',
    mode: 'standard',
    participantsCount: 60,
  },
]

/**
 * Seeds one campaign for an organisation, with its participants: the
 * simulations are created with the shape's count, attached to the poll, and the
 * poll is left with a pending statistics computation for the worker to pick up.
 */
const seedPoll = async ({
  organisation,
  shape,
}: {
  organisation: Organisation
  shape: PollSeedShape
}): Promise<Poll> => {
  const poll = await pollFactory
    .withOrganisation({
      id: organisation.id,
      name: organisation.name,
      slug: organisation.slug,
    })
    .withParticipantsCount(shape.participantsCount)
    .withPendingComputation(new Date())
    .create({ name: shape.name, mode: shape.mode })

  await seedSimulations({ count: shape.participantsCount, pollId: poll.id })

  return poll
}

/**
 * Seeds the default campaigns for every given organisation.
 */
export const seedPolls = async ({
  organisations,
  shapes = defaultPollSeedShapes,
}: {
  organisations: Organisation[]
  shapes?: PollSeedShape[]
}): Promise<Poll[]> => {
  const polls: Poll[] = []

  for (const organisation of organisations) {
    for (const shape of shapes) {
      polls.push(await seedPoll({ organisation, shape }))
    }
  }

  return polls
}

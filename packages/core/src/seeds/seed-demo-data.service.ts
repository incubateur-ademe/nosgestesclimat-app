import { ensureSeddEvent } from '../features/events/services/ensure-sedd-event.service.ts'
import { seedOrganisation } from '../features/organisations/seeds/organisation.seed.ts'
import { findPollBySlug } from '../features/polls/repositories/poll.repository.ts'
import { seedPollStats } from '../features/polls/seeds/poll-stats.seed.ts'
import {
  defaultPollSeedShapes,
  pollSlug,
  seedPoll,
  type PollSeedShape,
} from '../features/polls/seeds/poll.seed.ts'
import { findLatestSimulation } from '../features/simulations/repository/simulation.repository.ts'
import { seedSimulations } from '../features/simulations/seeds/simulations.seed.ts'
import {
  readSeedAdminEmails,
  seedVerifiedUser,
  slugifyEmail,
} from '../features/users/seeds/users.seed.ts'

/**
 * A seeded poll, as the orchestrator reports it back to its caller.
 */
export interface SeededPoll {
  id: string
  slug: string
  participantsCount: number
}

export interface SeedDemoDataResult {
  polls: SeededPoll[]
  organisations: number
  accounts: number
}

/**
 * Progress reporting. The caller decides what to do with the lines: the local
 * seed prints them, a job logs them, a test may discard them.
 */
export type SeedReporter = (message: string) => void

const noopReporter: SeedReporter = () => {}

/**
 * Seeds everything a local database needs to exercise the app: for every
 * `SEED_ADMIN_EMAILS` entry, an account, its organisation, the account's own
 * simulation, and its campaigns with their participants and statistics.
 *
 * The action catalogue is not seeded here: it comes from the Notion sync, and
 * the simulations' action assessments are built from it.
 *
 */
export const seedDemoData = async ({
  report = noopReporter,
}: { report?: SeedReporter } = {}): Promise<SeedDemoDataResult> => {
  report('Seeding the default event…')
  await ensureSeddEvent()

  const emails = readSeedAdminEmails()
  const polls: SeededPoll[] = []

  if (emails.length === 0) {
    report(
      'No SEED_ADMIN_EMAILS: skipping the accounts, organisations and campaigns.'
    )
  }

  for (const email of emails) {
    report(`Seeding the account ${email}…`)

    const account = await seedVerifiedUser(email)
    const emailSlug = slugifyEmail(email)

    const { organisation } = await seedOrganisation({
      slug: `organisation-${emailSlug}`,
      name: `Organisation de démonstration (${email})`,
      administratorEmail: account.email,
    })

    // The account's own simulation, so the personalised pages have something
    // to show. It is deliberately attached to no poll: a poll participation is
    // an anonymous answer, and the account stands for the organisation's
    // administrator rather than for one of its participants.
    const existingSimulation = await findLatestSimulation({
      userId: account.id,
    })

    if (!existingSimulation) {
      report(`Seeding the simulation of ${email}…`)
      await seedSimulations({ count: 1, userId: account.id })
    }

    report(`Seeding the campaigns of ${email}…`)
    for (const shape of defaultPollSeedShapes) {
      polls.push(await seedPollIfMissing({ shape, organisation, report }))
    }
  }

  report('Computing the campaign statistics…')
  const stats = await seedPollStats(polls.map(({ id }) => id))
  const participants = stats.reduce(
    (total, { participantsCount }) => total + participantsCount,
    0
  )
  report(
    `Campaign statistics computed for ${stats.length} poll(s), ${participants} participant(s)`
  )

  return {
    polls,
    organisations: emails.length,
    accounts: emails.length,
  }
}

/**
 * Seeds one campaign, unless it is already there.
 *
 */
const seedPollIfMissing = async ({
  shape,
  organisation,
  report,
}: {
  shape: PollSeedShape
  organisation: { id: string; slug: string }
  report: SeedReporter
}): Promise<SeededPoll> => {
  const slug = pollSlug({ organisationSlug: organisation.slug, shape })

  const existing = await findPollBySlug(slug)

  if (existing) {
    report(`Campaign "${shape.name}" already exists, skipping`)

    return {
      id: existing.id,
      slug: existing.slug,
      participantsCount: existing.participantsCount,
    }
  }

  const simulationIds = await seedSimulations({
    count: shape.participantsCount,
  })

  const poll = await seedPoll({
    organisationId: organisation.id,
    slug,
    shape,
    simulationIds,
  })

  return {
    id: poll.id,
    slug: poll.slug,
    participantsCount: shape.participantsCount,
  }
}

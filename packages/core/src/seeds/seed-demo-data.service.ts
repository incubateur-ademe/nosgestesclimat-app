import { ensureSeddEvent } from '../features/events/services/ensure-sedd-event.service.ts'
import { noopLogger, type Logger } from '../features/logger/index.ts'
import { organisationFactory } from '../features/organisations/factories/organisation.factory.ts'
import { seedPolls } from '../features/polls/seeds/poll.seed.ts'
import { seedSimulations } from '../features/simulations/seeds/simulations.seed.ts'
import { userFactory } from '../features/users/factories/user.factory.ts'
import {
  haveSeedUsers,
  readSeedAdminEmails,
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
  /** True when a previous run had already seeded the demo accounts. */
  skipped: boolean
  polls: SeededPoll[]
  organisations: number
  accounts: number
}

/**
 * Seeds everything a local database needs to exercise the app: for every
 * `SEED_ADMIN_EMAILS` entry, an account, its organisation, the account's own
 * simulation, and its campaigns with their participants.
 *
 * The action catalogue is not seeded here: it comes from the Notion sync, and
 * the simulations' action assessments are built from it.
 *
 * The run is idempotent by skipping entirely when the demo accounts are already
 * there, rather than by making every step tolerate partial data.
 */
export const seedDemoData = async ({
  logger = noopLogger,
}: { logger?: Logger } = {}): Promise<SeedDemoDataResult> => {
  logger.info('Seeding the default event…')
  await ensureSeddEvent()

  const emails = readSeedAdminEmails()

  if (emails.length === 0) {
    logger.info(
      'No SEED_ADMIN_EMAILS: skipping the accounts, organisations and campaigns.'
    )

    return { skipped: false, polls: [], organisations: 0, accounts: 0 }
  }

  if (await haveSeedUsers(emails)) {
    logger.info('Demo data already seeded: skipping.')

    return { skipped: true, polls: [], organisations: 0, accounts: 0 }
  }

  logger.info(`Seeding ${emails.length} account(s)…`)
  const users = await Promise.all(
    emails.map((email) => userFactory.verified().create({ email }))
  )

  logger.info(`Seeding ${emails.length} organisation(s)…`)
  const organisations = await Promise.all(
    emails.map((email) =>
      organisationFactory
        .withAdministrator(email)
        .create({ name: `Organisation de démonstration (${email})` })
    )
  )

  logger.info('Seeding the campaigns and their participants…')
  const polls = await seedPolls({ organisations })

  for (const user of users) {
    logger.info(`Seeding the simulation of ${user.email}…`)
    await seedSimulations({ count: 1, userId: user.id })
  }

  return {
    skipped: false,
    polls: polls.map(({ id, slug, participantsCount }) => ({
      id,
      slug,
      participantsCount,
    })),
    organisations: organisations.length,
    accounts: users.length,
  }
}

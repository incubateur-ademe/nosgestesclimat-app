import { faker } from '@faker-js/faker'
import { prisma } from '../../../prisma/client.ts'
import type { PollMode } from '../../../prisma/generated/enums.ts'
import { actionAssessmentFactory } from '../../actions/factories/action-assessment.factory.ts'
import { actionFactory } from '../../actions/factories/action.factory.ts'
import { ensureSeddEvent } from '../../events/services/ensure-sedd-event.service.ts'
import { simulationFactory } from '../../simulation-computation/factories/simulation.factory.ts'
import { generateDemoSimulationData } from './generate-demo-simulation.ts'

const DEMO_POLLS: {
  name: string
  slug: string
  mode: PollMode
  simulationCount: number
}[] = [
  {
    name: 'Campagne de démonstration',
    slug: 'campagne-demonstration',
    mode: 'standard',
    simulationCount: 2,
  },
  {
    name: 'Campagne avec 60 réponses',
    slug: 'campagne-60-reponses',
    mode: 'standard',
    simulationCount: 60,
  },
]

/** Slugify the local part of an email (before the @) for a unique slug. */
const slugifyEmail = (email: string) =>
  email
    .split('@')[0]
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const startedAt = Date.now()
const PROGRESS_BAR_WIDTH = 24

const logProgress = (message: string) => {
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`[seed +${elapsed}s] ${message}`)
}

const renderPollProgress = ({
  label,
  current,
  total,
}: {
  label: string
  current: number
  total: number
}) => {
  const ratio = total === 0 ? 0 : Math.min(current / total, 1)
  const filled = Math.round(ratio * PROGRESS_BAR_WIDTH)
  const bar = '█'.repeat(filled) + '░'.repeat(PROGRESS_BAR_WIDTH - filled)
  const percent = Math.round(ratio * 100)
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(
    `[seed +${elapsed}s] ${label} ${bar} ${current}/${total} (${percent}%)`
  )
}

const demoAdminEmails = () => {
  const configured = process.env.SEED_ADMIN_EMAILS?.split(',')
    .map((email) => email.trim().toLocaleLowerCase())
    .filter(Boolean)

  if (!configured?.length) {
    throw new Error(
      'SEED_ADMIN_EMAILS is required to seed demo data. Set a comma-separated list of admin emails, e.g. "admin1@example.com,admin2@example.com".'
    )
  }

  return configured
}

const ensureDemoAdmin = async (email: string) => {
  const existing = await prisma.verifiedUser.findUnique({ where: { email } })
  const id = existing?.id ?? faker.string.uuid()

  await prisma.user.upsert({
    where: { id },
    update: { email },
    create: { id, email },
  })

  return prisma.verifiedUser.upsert({
    where: { email },
    update: { id },
    create: { id, email },
  })
}

/**
 * Creates a completed demo simulation with a realistic persona situation and
 * its computed results, so poll statistics (funFacts, computedResults) compute
 * real values instead of empty ones. Progression is forced to 1: simulations
 * are only counted by the poll stats when fully completed (isValidSimulation).
 */
const createDemoSimulation = async ({ userId }: { userId: string | null }) => {
  const { situation, computedResults } = generateDemoSimulationData()

  return simulationFactory
    .params({ userId, progression: 1 })
    .transient({ situation, computedResults })
    .withCompletedComputation()
    .create()
}

/**
 * Seeds the demo dataset and returns the ids of the polls it created, so the
 * caller (the server seed job) can compute their funFacts/computedResults.
 */
export const seedDemoData = async (): Promise<string[]> => {
  logProgress('Seed started')
  await ensureSeddEvent()
  logProgress('SEDD event ensured')

  const existingAction = await prisma.action.findFirst()
  if (!existingAction) {
    logProgress('Seeding action catalogue…')
    await seedDemoActions()
    logProgress('Action catalogue seeded')
  } else {
    logProgress('Action catalogue already exists, skipping')
  }

  const pollIds: string[] = []
  const emails = demoAdminEmails()
  for (const email of emails) {
    logProgress(`Seeding admin ${email}…`)
    pollIds.push(...(await seedDemoAdmin(email)))
    logProgress(`Admin ${email} seeded (${pollIds.length} polls so far)`)
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  logProgress(
    `Done: ${emails.length} admin${emails.length > 1 ? 's' : ''}, ${pollIds.length} polls, in ${elapsed}s`
  )

  return pollIds
}

const seedDemoActions = async () => {
  const actions = await actionFactory.published().createList(15)

  const translatedActions = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      actionFactory
        .published()
        .params({
          title: `Action en français ${i + 1}`,
          slug: `action-francais-${i + 1}`,
        })
        .withTranslations({
          en: {
            title: `English action ${i + 1}`,
            slug: `english-action-${i + 1}`,
            longDescription: `### English action ${i + 1}\n\nSome english content.`,
          },
        })
        .create()
    )
  )

  const draftActions = await actionFactory.draft().createList(5)
  const scheduledActions = await actionFactory.scheduled().createList(5)
  const pendingDeletionActions = await actionFactory
    .published()
    .pendingDeletion()
    .createList(5)
  const deletedActions = await actionFactory.published().deleted().createList(5)

  logProgress(
    `Action catalogue seeded: ${actions.length} published, ${translatedActions.length} translated, ${draftActions.length} draft, ${scheduledActions.length} scheduled, ${pendingDeletionActions.length} pending-deletion, ${deletedActions.length} deleted`
  )
}

const seedDemoAdmin = async (email: string): Promise<string[]> => {
  const admin = await ensureDemoAdmin(email)

  const slug = `organisation-${slugifyEmail(email)}`
  const organisation = await prisma.organisation.upsert({
    where: { slug },
    update: {},
    create: {
      name: `Organisation de démonstration (${email})`,
      slug,
      type: 'company',
    },
  })

  await prisma.organisationAdministrator.upsert({
    where: { userEmail: admin.email },
    update: { organisationId: organisation.id },
    create: { userEmail: admin.email, organisationId: organisation.id },
  })

  const seededPollIds: string[] = []

  // The admin's own simulation — owned by the verified user, NOT part of any
  // poll — with a full set of action assessments so the personalised actions
  // pages render. Idempotent: once this user has a simulation, re-running
  // leaves it untouched.
  const existingUserSimulation = await prisma.simulation.findFirst({
    where: { userId: admin.id },
  })
  if (!existingUserSimulation) {
    const userSim = await createDemoSimulation({ userId: admin.id })

    const publishedActions = await prisma.action.findMany({
      where: {
        publishedAt: { not: null },
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    })

    await Promise.all([
      ...publishedActions.slice(0, 8).map((action, i) =>
        actionAssessmentFactory
          .params({ simulationId: userSim.id, actionId: action.id })
          .applicable({ impact: (8 - i) * 350 })
          .create()
      ),
      ...publishedActions
        .slice(8, 12)
        .map((action) =>
          actionAssessmentFactory
            .params({ simulationId: userSim.id, actionId: action.id })
            .inapplicable()
            .create()
        ),
      ...publishedActions
        .slice(12)
        .map((action) =>
          actionAssessmentFactory
            .params({ simulationId: userSim.id, actionId: action.id })
            .unknownApplicability()
            .create()
        ),
    ])
  }

  for (const poll of DEMO_POLLS) {
    const dbPoll = await prisma.poll.upsert({
      where: { slug: `${slug}-${poll.slug}` },
      update: {},
      create: {
        name: poll.name,
        slug: `${slug}-${poll.slug}`,
        organisationId: organisation.id,
        mode: poll.mode,
        customAdditionalQuestions: {},
        computeRealTimeStats: true,
      },
    })
    seededPollIds.push(dbPoll.id)

    // Simulations are anonymous (userId: null) — the env user is only the
    // organisation administrator and owns none of them. Idempotent: once the
    // poll has simulations, re-running leaves them untouched.
    const existingPollSimulation = await prisma.simulationPoll.findFirst({
      where: { pollId: dbPoll.id },
    })
    if (existingPollSimulation) {
      logProgress(`Poll "${poll.name}" already has simulations, skipping`)
      continue
    }

    logProgress(
      `Poll "${poll.name}": creating ${poll.simulationCount} simulations…`
    )
    const simulations: Awaited<ReturnType<typeof createDemoSimulation>>[] = []
    for (let i = 0; i < poll.simulationCount; i++) {
      simulations.push(await createDemoSimulation({ userId: null }))
      if ((i + 1) % 10 === 0 || i + 1 === poll.simulationCount) {
        renderPollProgress({
          label: `Poll "${poll.name}"`,
          current: i + 1,
          total: poll.simulationCount,
        })
      }
    }

    await prisma.simulationPoll.createMany({
      data: simulations.map((simulation) => ({
        pollId: dbPoll.id,
        simulationId: simulation.id,
      })),
    })
    logProgress(
      `Poll "${poll.name}": ${poll.simulationCount} simulations created and linked`
    )

    // Assessments on the first poll only, so the "applicable / inapplicable /
    // unknown" variety is demoed without creating 60 × N assessment rows.
    if (poll.simulationCount === 2) {
      const [sim1, sim2] = simulations
      const publishedActions = await prisma.action.findMany({
        where: {
          publishedAt: { not: null },
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
      })

      await Promise.all([
        ...publishedActions.slice(0, 8).map((action, i) =>
          actionAssessmentFactory
            .params({ simulationId: sim1.id, actionId: action.id })
            .applicable({ impact: (8 - i) * 350 })
            .create()
        ),
        ...publishedActions
          .slice(8, 12)
          .map((action) =>
            actionAssessmentFactory
              .params({ simulationId: sim1.id, actionId: action.id })
              .inapplicable()
              .create()
          ),
        ...publishedActions
          .slice(12)
          .map((action) =>
            actionAssessmentFactory
              .params({ simulationId: sim1.id, actionId: action.id })
              .unknownApplicability()
              .create()
          ),
        ...publishedActions.slice(0, 4).map((action, i) =>
          actionAssessmentFactory
            .params({ simulationId: sim2.id, actionId: action.id })
            .applicable({ impact: (4 - i) * 200 })
            .create()
        ),
      ])
    }
  }

  return seededPollIds
}

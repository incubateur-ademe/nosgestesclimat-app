import { actionAssessmentFactory } from '../src/features/actions/factories/action-assessment.factory.ts'
import { actionFactory } from '../src/features/actions/factories/action.factory.ts'
import { simulationFactory } from '../src/features/simulation-computation/factories/simulation.factory.ts'
import { userFactory } from '../src/features/users/factories/user.factory.ts'
import { prisma } from '../src/prisma/client.ts'

const seed = async () => {
  // Actions
  // No English translation on purpose, to exercise the French fallback
  // on catalogue / detail pages when a locale is missing.
  const publishedActions = await actionFactory.published().createList(15)

  // Fully translated actions, to exercise locale switching on catalogue /
  // detail pages.
  const translatedActions = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      actionFactory
        .published()
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

  await actionFactory.draft().createList(5)
  await actionFactory.scheduled().createList(5)
  const pendingDeletionActions = await actionFactory
    .published()
    .pendingDeletion()
    .createList(5)
  const deletedActions = await actionFactory.published().deleted().createList(5)

  // User 1 — completed simulation with a full set of assessments
  const user1 = await userFactory.create()
  const sim1 = await simulationFactory
    .params({ userId: user1.id })
    .withCompletedComputation()
    .create()

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
    ...pendingDeletionActions.map((action) =>
      actionAssessmentFactory
        .params({ simulationId: sim1.id, actionId: action.id })
        .applicable()
        .create()
    ),
    ...deletedActions.map((action) =>
      actionAssessmentFactory
        .params({ simulationId: sim1.id, actionId: action.id })
        .applicable()
        .create()
    ),
    ...translatedActions.map((action) =>
      actionAssessmentFactory
        .params({ simulationId: sim1.id, actionId: action.id })
        .applicable()
        .create()
    ),
  ])

  // User 2 — two simulations: an older completed one and a newer pending one
  const user2 = await userFactory.create()
  const sim2old = await simulationFactory
    .params({ userId: user2.id, createdAt: new Date('2024-01-01') })
    .withCompletedComputation()
    .create()
  const sim2new = await simulationFactory
    .params({ userId: user2.id })
    .withPendingComputation()
    .create()

  await Promise.all([
    ...publishedActions.slice(0, 6).map((action, i) =>
      actionAssessmentFactory
        .params({ simulationId: sim2old.id, actionId: action.id })
        .applicable({ impact: (6 - i) * 200 })
        .create()
    ),
    ...publishedActions.slice(0, 4).map((action, i) =>
      actionAssessmentFactory
        .params({ simulationId: sim2new.id, actionId: action.id })
        .applicable({ impact: (4 - i) * 500 })
        .create()
    ),
  ])
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

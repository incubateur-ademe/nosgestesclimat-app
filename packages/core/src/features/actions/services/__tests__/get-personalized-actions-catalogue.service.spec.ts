import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulation-computation/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionAssessmentFactory } from '../../factories/action-assessment.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPersonalizedActionsCatalogue } from '../get-personalized-actions-catalogue.service.ts'

describe('getPersonalizedActionsCatalogue', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.simulation.deleteMany() // cascades to simulationComputation
    await prisma.user.deleteMany()
    await prisma.action.deleteMany()
  })

  it('returns null status, no actions and no top actions when there are no actions', async () => {
    const user = await userFactory.create()
    const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
    expect(result.assessmentStatus).toBeNull()
    expect(result.actions).toEqual([])
    expect(result.topActions).toEqual([])
  })

  describe('when the user has no simulation', () => {
    it('returns null status, all visible actions without assessments, and no top actions', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
      expect(result).toEqual({
        assessmentStatus: null,
        actions: [expect.objectContaining({ id: action.id, assessment: null })],
        topActions: [],
      })
    })
  })

  describe('when the latest completed simulation has no computation (old simulation)', () => {
    it('returns null status, all visible actions without assessments, and no top actions', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()
      await simulationFactory.completed().params({ userId: user.id }).create()

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
      expect(result).toEqual({
        assessmentStatus: null,
        actions: [expect.objectContaining({ id: action.id, assessment: null })],
        topActions: [],
      })
    })
  })

  describe('when the latest simulation computation is not yet completed', () => {
    it.each(['pending', 'processing', 'failed'] as const)(
      'returns "%s" status and all visible actions without assessments',
      async (status) => {
        const action = await actionFactory.published().create()
        const user = await userFactory.create()
        await simulationFactory
          .completed()
          .params({ userId: user.id })
          .withComputationStatus(status)
          .create()

        const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
        expect(result).toEqual({
          assessmentStatus: status,
          actions: [
            expect.objectContaining({ id: action.id, assessment: null }),
          ],
          topActions: [],
        })
      }
    )

    it('returns no assessments even when a previous simulation has assessments', async () => {
      const [applicable, inapplicable] = await Promise.all([
        actionFactory.published().create(),
        actionFactory.published().create(),
      ])

      const user = await userFactory.create()
      const [older] = await Promise.all([
        simulationFactory
          .completed()
          .params({ userId: user.id, createdAt: new Date('2024-01-01') })
          .withCompletedComputation()
          .create(),
        simulationFactory
          .completed()
          .params({ userId: user.id, createdAt: new Date('2024-06-01') })
          .withPendingComputation()
          .create(),
        simulationFactory
          .started()
          .params({ userId: user.id, createdAt: new Date('2024-12-01') })
          .create(),
      ])

      await Promise.all([
        actionAssessmentFactory
          .params({ simulationId: older.id, actionId: applicable.id })
          .applicable({ impact: 1000 })
          .create(),
        actionAssessmentFactory
          .params({ simulationId: older.id, actionId: inapplicable.id })
          .inapplicable()
          .create(),
      ])

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
      expect(result).toEqual({
        assessmentStatus: null,
        actions: expect.arrayContaining([
          expect.objectContaining({ id: applicable.id, assessment: null }),
          expect.objectContaining({ id: inapplicable.id, assessment: null }),
        ]),
        topActions: [],
      })
    })
  })

  describe('when the latest simulation computation is completed', () => {
    it('returns only applicable actions sorted by impact desc, unknown impact last', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .withCompletedComputation()
        .create()

      const [high, low, noImpact, inapplicable, unknownApplicability] =
        await Promise.all([
          actionFactory.published().create(),
          actionFactory.published().create(),
          actionFactory.published().create(),
          actionFactory.published().create(),
          actionFactory.published().create(),
        ])

      const [highAssessment, lowAssessment, noImpactAssessment] =
        await Promise.all([
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: high.id })
            .applicable({ impact: 1000 })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: low.id })
            .applicable({ impact: 200 })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: noImpact.id })
            .applicable({ impact: undefined })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: inapplicable.id })
            .inapplicable()
            .create(),
          actionAssessmentFactory
            .params({
              simulationId: simulation.id,
              actionId: unknownApplicability.id,
            })
            .unknownApplicability()
            .create(),
        ])

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')

      expect(result).toEqual({
        assessmentStatus: 'completed',
        actions: [
          { ...high, assessment: highAssessment, choice: null },
          { ...low, assessment: lowAssessment, choice: null },
          { ...noImpact, assessment: noImpactAssessment, choice: null },
        ],
        topActions: [
          { ...high, assessment: highAssessment, choice: null },
          { ...low, assessment: lowAssessment, choice: null },
        ],
      })
    })

    it('returns at most 3 top actions when more than 3 actions have impact', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .withCompletedComputation()
        .create()

      const [first, second, third, fourth] = await Promise.all([
        actionFactory.published().create(),
        actionFactory.published().create(),
        actionFactory.published().create(),
        actionFactory.published().create(),
      ])

      const [firstAssessment, secondAssessment, thirdAssessment] =
        await Promise.all([
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: first.id })
            .applicable({ impact: 1000 })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: second.id })
            .applicable({ impact: 800 })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: third.id })
            .applicable({ impact: 600 })
            .create(),
          actionAssessmentFactory
            .params({ simulationId: simulation.id, actionId: fourth.id })
            .applicable({ impact: 400 })
            .create(),
        ])

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')

      expect(result.topActions).toEqual([
        { ...first, assessment: firstAssessment, choice: null },
        { ...second, assessment: secondAssessment, choice: null },
        { ...third, assessment: thirdAssessment, choice: null },
      ])
    })

    it('excludes deleted and unpublished actions', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .withCompletedComputation()
        .create()

      const [draft, scheduled, deleted] = await Promise.all([
        actionFactory.draft().create(),
        actionFactory.published().scheduled().create(),
        actionFactory.published().deleted().create(),
      ])

      await Promise.all([
        actionAssessmentFactory
          .params({ simulationId: simulation.id, actionId: draft.id })
          .applicable({ impact: 300 })
          .create(),
        actionAssessmentFactory
          .params({ simulationId: simulation.id, actionId: scheduled.id })
          .applicable({ impact: 400 })
          .create(),
        actionAssessmentFactory
          .params({ simulationId: simulation.id, actionId: deleted.id })
          .applicable({ impact: 500 })
          .create(),
      ])

      const result = await getPersonalizedActionsCatalogue(user.id, 'fr')
      expect(result).toEqual({
        assessmentStatus: 'completed',
        actions: [],
        topActions: [],
      })
    })
  })

  describe('when locale is "en"', () => {
    it('hides actions with no English translation', async () => {
      await actionFactory.published().create()
      const user = await userFactory.create()

      const result = await getPersonalizedActionsCatalogue(user.id, 'en')

      expect(result.actions).toEqual([])
      expect(result.topActions).toEqual([])
    })

    it('includes actions with an English translation, using its content', async () => {
      const media = {
        type: 'image',
        title: 'English media title',
        src: 'https://example.com/image.jpg',
        alt: 'alt text',
      } as const
      const metadata = {
        title: 'English SEO title',
        description: 'English SEO description',
        jsonLd: { '@context': 'https://schema.org', '@graph': [] },
      } as const
      const action = await actionFactory
        .published()
        .withTranslations({
          en: {
            title: 'English title',
            slug: 'english-slug',
            longDescription: 'English description',
            tips: 'English tips',
            financialIncentives: 'English financial incentives',
            furtherExplore: 'English further explore',
            media,
            metadata,
          },
        })
        .create()
      await actionFactory.published().create() // untranslated, must be excluded

      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .create()
      const assessment = await actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: action.id })
        .applicable({ impact: 500 })
        .create()

      const result = await getPersonalizedActionsCatalogue(user.id, 'en')

      expect(result.actions).toEqual([
        expect.objectContaining({
          id: action.id,
          title: 'English title',
          longDescription: 'English description',
          tips: 'English tips',
          financialIncentives: 'English financial incentives',
          furtherExplore: 'English further explore',
          media,
          metadata,
          assessment,
        }),
      ])
    })
  })
})

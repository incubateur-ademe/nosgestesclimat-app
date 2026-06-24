import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulation-computation/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionAssessmentFactory } from '../../factories/action-assessment.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPublicActionsCatalogue } from '../get-public-actions-catalogue.service.ts'

describe('getPublicActionsCatalogue', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.simulation.deleteMany() // cascades to simulationComputation
    await prisma.user.deleteMany()
    await prisma.action.deleteMany()
  })

  it('returns no actions and no top actions when there are no actions', async () => {
    const user = await userFactory.create()
    const result = await getPublicActionsCatalogue(user.id)
    expect(result.actions).toEqual([])
    expect(result.topActions).toEqual([])
  })

  describe('when the user has no simulation', () => {
    it('returns all visible actions without assessments, and no top actions', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()

      const result = await getPublicActionsCatalogue(user.id)
      expect(result).toEqual({
        actions: [expect.objectContaining({ id: action.id, assessment: null })],
        topActions: [],
      })
    })
  })

  describe('topActions', () => {
    it('returns the curated highlighted actions in their fixed order, regardless of creation order', async () => {
      const user = await userFactory.create()

      const [viande, avion, trajets] = await Promise.all([
        actionFactory.published().params({ slug: 'limiter-viande' }).create(),
        actionFactory.published().params({ slug: 'limiter-avion' }).create(),
        actionFactory
          .published()
          .params({ slug: 'petits-trajets-sans-voiture' })
          .create(),
      ])

      const result = await getPublicActionsCatalogue(user.id)

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: avion.id }),
        expect.objectContaining({ id: trajets.id }),
        expect.objectContaining({ id: viande.id }),
      ])
    })

    it('skips curated slugs that have no matching visible action', async () => {
      const user = await userFactory.create()

      const avion = await actionFactory
        .published()
        .params({ slug: 'limiter-avion' })
        .create()

      const result = await getPublicActionsCatalogue(user.id)

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: avion.id }),
      ])
    })

    it('prefers personalized impact-based actions over the curated highlighted actions', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .withCompletedComputation()
        .create()

      const [avion, mostImpactful] = await Promise.all([
        actionFactory.published().params({ slug: 'limiter-avion' }).create(),
        actionFactory.published().create(),
      ])

      await actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: mostImpactful.id })
        .applicable({ impact: 1000 })
        .create()

      const result = await getPublicActionsCatalogue(user.id)

      expect(result.topActions).toEqual([
        expect.objectContaining({ id: mostImpactful.id }),
      ])
      expect(result.topActions).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: avion.id })])
      )
    })
  })

  describe('when the latest simulation computation is completed', () => {
    it('returns all actions sorted by quantifiable impact desc, with non-quantifiable, inapplicable and unassessed actions last', async () => {
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

      const [
        highAssessment,
        lowAssessment,
        noImpactAssessment,
        inapplicableAssessment,
        unknownApplicabilityAssessment,
      ] = await Promise.all([
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

      const result = await getPublicActionsCatalogue(user.id)

      expect(result).toEqual({
        actions: [
          { ...high, assessment: highAssessment, choice: null },
          { ...low, assessment: lowAssessment, choice: null },
          { ...noImpact, assessment: noImpactAssessment, choice: null },
          {
            ...inapplicable,
            assessment: inapplicableAssessment,
            choice: null,
          },
          {
            ...unknownApplicability,
            assessment: unknownApplicabilityAssessment,
            choice: null,
          },
        ],
        // Personalized impact-based actions take precedence over the
        // curated highlighted actions
        topActions: [
          { ...high, assessment: highAssessment, choice: null },
          { ...low, assessment: lowAssessment, choice: null },
        ],
      })
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

      const result = await getPublicActionsCatalogue(user.id)
      expect(result).toEqual({
        actions: [],
        topActions: [],
      })
    })
  })
})

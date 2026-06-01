import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../publicodes-computation/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionAssessmentFactory } from '../../factories/action-assessment.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPersonalizedActions } from '../get-personalized-actions.service.ts'

describe('getPersonalizedActions', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.simulation.deleteMany() // cascades to simulationComputation
    await prisma.user.deleteMany()
    await prisma.action.deleteMany()
  })

  describe('lastSimulationAssessmentStatus', () => {
    it('is null when the user has no simulation', async () => {
      const result = await getPersonalizedActions(faker.string.uuid())
      expect(result.lastSimulationAssessmentStatus).toBeNull()
    })

    it('is null when the simulation has no computation', async () => {
      const user = await userFactory.create()
      await simulationFactory.params({ userId: user.id }).create()

      const result = await getPersonalizedActions(user.id)
      expect(result.lastSimulationAssessmentStatus).toBeNull()
    })

    it('is "completed" when the latest simulation computation is completed', async () => {
      const user = await userFactory.create()
      await simulationFactory
        .params({ userId: user.id })
        .withCompletedComputation()
        .create()

      const result = await getPersonalizedActions(user.id)
      expect(result.lastSimulationAssessmentStatus).toBe('completed')
    })

    it.each(['pending', 'processing', 'failed'] as const)(
      'is "%s" when the latest simulation computation is %s',
      async (status) => {
        const user = await userFactory.create()
        await simulationFactory
          .params({ userId: user.id })
          .withComputationStatus(status)
          .create()

        const result = await getPersonalizedActions(user.id)
        expect(result.lastSimulationAssessmentStatus).toBe(status)
      }
    )

    it('reflects the latest simulation, not an older one', async () => {
      const user = await userFactory.create()
      await Promise.all([
        simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-01-01') })
          .withCompletedComputation()
          .create(),
        simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-06-01') })
          .withPendingComputation()
          .create(),
      ])

      const result = await getPersonalizedActions(user.id)
      expect(result.lastSimulationAssessmentStatus).toBe('pending')
    })
  })

  describe('actions', () => {
    it('returns an empty list when the user has no simulation', async () => {
      const result = await getPersonalizedActions(faker.string.uuid())
      expect(result.actions).toEqual([])
    })

    it('returns only applicable actions sorted by impact desc, unknown impact last', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .params({ userId: user.id })
        .create()

      const [high, low, noImpact, inapplicable] = await Promise.all([
        actionFactory.published().create(),
        actionFactory.published().create(),
        actionFactory.published().create(),
        actionFactory.published().create(),
      ])

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
      ])

      const result = await getPersonalizedActions(user.id)
      expect(result.actions).toEqual([
        expect.objectContaining({ id: high.id }),
        expect.objectContaining({ id: low.id }),
        expect.objectContaining({ id: noImpact.id }),
      ])
    })

    it('when the same action was assessed in multiple simulations, uses the latest simulation assessments', async () => {
      const user = await userFactory.create()
      const [older, newer] = await Promise.all([
        simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-01-01') })
          .create(),
        simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-06-01') })
          .create(),
      ])

      const action = await actionFactory.published().create()

      await Promise.all([
        actionAssessmentFactory
          .params({
            simulationId: older.id,
            actionId: action.id,
            createdAt: new Date('2024-01-02'),
          })
          .applicable({ impact: 500 })
          .create(),
        actionAssessmentFactory
          .params({
            simulationId: newer.id,
            actionId: action.id,
            createdAt: new Date('2024-06-02'),
          })
          .applicable({ impact: 100 })
          .create(),
      ])

      const result = await getPersonalizedActions(user.id)
      expect(result.actions).toHaveLength(1)
      expect(result.actions[0].assessment.impact).toBe(100)
    })

    it('excludes deleted and unpublished actions', async () => {
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .params({ userId: user.id })
        .create()

      const [deleted, draft] = await Promise.all([
        actionFactory.published().deleted().create(),
        actionFactory.draft().create(),
      ])

      await Promise.all([
        actionAssessmentFactory
          .params({ simulationId: simulation.id, actionId: deleted.id })
          .applicable({ impact: 500 })
          .create(),
        actionAssessmentFactory
          .params({ simulationId: simulation.id, actionId: draft.id })
          .applicable({ impact: 300 })
          .create(),
      ])

      const result = await getPersonalizedActions(user.id)
      expect(result.actions).toHaveLength(0)
    })
  })
})

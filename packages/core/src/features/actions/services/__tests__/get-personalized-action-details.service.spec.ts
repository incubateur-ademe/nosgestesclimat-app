import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulation-computation/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionAssessmentFactory } from '../../factories/action-assessment.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { getPersonalizedActionDetails } from '../get-personalized-action-details.service.ts'

describe('getPersonalizedActionDetails', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
    await prisma.action.deleteMany()
  })

  describe('action visibility', () => {
    it('returns null when no action matches the slug', async () => {
      const user = await userFactory.create()
      expect(
        await getPersonalizedActionDetails('non-existent', user.id)
      ).toBeNull()
    })

    it.each([
      ['draft', () => actionFactory.draft()],
      ['scheduled', () => actionFactory.scheduled()],
      ['deleted', () => actionFactory.published().deleted()],
    ])('returns null when action is %s', async (_, factory) => {
      const user = await userFactory.create()
      const action = await factory().create()
      expect(
        await getPersonalizedActionDetails(action.slug, user.id)
      ).toBeNull()
    })
  })

  describe('without assessment', () => {
    it('returns a PersonalizedAction without assessment when userId is undefined', async () => {
      const action = await actionFactory.published().create()

      const result = await getPersonalizedActionDetails(action.slug, undefined)

      expect.assert(result)
      expect(result.assessment).toBeNull()
    })

    it('returns a PersonalizedAction without assessment when user has no simulation', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()

      const result = await getPersonalizedActionDetails(action.slug, user.id)

      expect.assert(result)
      expect(result.assessment).toBeNull()
    })

    it('returns a PersonalizedAction without assessment when the simulation has no computation (old simulation)', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()
      await simulationFactory.completed().params({ userId: user.id }).create()

      const result = await getPersonalizedActionDetails(action.slug, user.id)

      expect.assert(result)
      expect(result.assessment).toBeNull()
    })

    it.each(['pending', 'processing', 'failed'] as const)(
      'returns a PersonalizedAction without assessment when the last simulation assessments have not completed (%s)',
      async (status) => {
        const action = await actionFactory.published().create()
        const user = await userFactory.create()

        const olderSimulation = await simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-01-01') })
          .completed()
          .create()
        await actionAssessmentFactory
          .params({ simulationId: olderSimulation.id, actionId: action.id })
          .applicable({ impact: 500 })
          .create()

        await simulationFactory
          .params({ userId: user.id, createdAt: new Date('2024-06-01') })
          .completed()
          .withComputationStatus(status)
          .create()

        const result = await getPersonalizedActionDetails(action.slug, user.id)

        expect.assert(result)
        expect(result.assessment).toBeNull()
      }
    )
  })

  describe('with assessment', () => {
    it('returns a PersonalizedAction with the assessment', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .create()

      const assessment = await actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: action.id })
        .create()

      const result = await getPersonalizedActionDetails(action.slug, user.id)

      expect(result).toEqual({
        ...action,
        assessment,
        choice: null,
      })
    })

    it('returns the assessment of the latest completed simulation', async () => {
      const action = await actionFactory.published().create()
      const user = await userFactory.create()
      const [older, newer, _justStarted] = await Promise.all([
        simulationFactory
          .completed()
          .params({ userId: user.id, createdAt: new Date('2024-01-01') })
          .create(),
        simulationFactory
          .completed()
          .params({ userId: user.id, createdAt: new Date('2024-06-01') })
          .create(),
        simulationFactory
          .started()
          .params({ userId: user.id, createdAt: new Date('2024-12-01') })
          .create(),
      ])

      const [, newerAssessment] = await Promise.all([
        actionAssessmentFactory
          .params({
            simulationId: older.id,
            actionId: action.id,
            createdAt: new Date('2024-01-02'),
          })
          .applicable({ impact: 800 })
          .create(),
        actionAssessmentFactory
          .params({
            simulationId: newer.id,
            actionId: action.id,
            createdAt: new Date('2024-06-02'),
          })
          .applicable({ impact: 300 })
          .create(),
      ])

      const result = await getPersonalizedActionDetails(action.slug, user.id)

      expect.assert(result)
      expect(result.assessment?.id).toBe(newerAssessment.id)
    })

    it('returns a PersonalizedAction when published but pending deletion', async () => {
      const action = await actionFactory.published().pendingDeletion().create()
      const user = await userFactory.create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .create()

      const assessment = await actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: action.id })
        .applicable({ impact: 500 })
        .create()

      const result = await getPersonalizedActionDetails(action.slug, user.id)

      expect.assert(result)
      expect(result.assessment?.id).toBe(assessment.id)
    })
  })
})

import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionChoiceFactory } from '../../factories/action-choice.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { createCancelActionCommitment } from '../cancel-action-commitment.service.ts'

describe('cancelActionCommitment', () => {
  afterEach(async () => {
    await prisma.actionChoice.deleteMany()
    await prisma.action.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should throw if the user id pass as an argument is invalid', async () => {
    const user = await userFactory.create()

    const action = await actionFactory.published().create()

    const cancelActionCommitment = createCancelActionCommitment()

    const actionChoice = await actionChoiceFactory.create({
      userId: user.id,
      actionId: action.id,
    })

    await expect(
      cancelActionCommitment({
        userId: faker.string.uuid(),
        actionChoiceId: actionChoice.id,
      })
    ).rejects.toThrow()
  })

  it('should throw if there is no action choice matching the id passed as parameter', async () => {
    const user = await userFactory.create()

    const cancelActionCommitment = createCancelActionCommitment()

    await expect(
      cancelActionCommitment({
        userId: user.id,
        actionChoiceId: faker.string.uuid(),
      })
    ).rejects.toThrow()
  })

  it('should delete an action choice matching the parameters passed', async () => {
    const user = await userFactory.create()

    const action = await actionFactory.published().create()

    const cancelActionCommitment = createCancelActionCommitment()

    const actionChoice = await actionChoiceFactory.create({
      userId: user.id,
      actionId: action.id,
    })

    await expect(
      cancelActionCommitment({
        userId: user.id,
        actionChoiceId: actionChoice.id,
      })
    ).resolves.toBeUndefined()
  })
})

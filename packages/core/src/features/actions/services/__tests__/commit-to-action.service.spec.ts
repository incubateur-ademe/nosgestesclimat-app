import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { createCommitToAction } from '../commit-to-action.service.service.ts'

describe('commitToAction()', () => {
  afterEach(async () => {
    await prisma.actionChoice.deleteMany()
    await prisma.action.deleteMany()
    await prisma.user.deleteMany()
  })

  it('creates a new action choice for a given user', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    const commitToAction = createCommitToAction()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: user.id,
      })
    ).resolves.toBeUndefined()
  })

  it('throws when an invalid userId is pass as an argument', async () => {
    const action = await actionFactory.published().create()

    await userFactory.create()

    const commitToAction = createCommitToAction()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: faker.string.uuid(),
      })
    ).rejects.toThrow()
  })

  it('throws when an invalid actionId is pass as an argument', async () => {
    const user = await userFactory.create()

    const commitToAction = createCommitToAction()

    const result = await commitToAction({
      actionId: faker.string.uuid(),
      userId: user.id,
    })

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
      })
    )
  })
})

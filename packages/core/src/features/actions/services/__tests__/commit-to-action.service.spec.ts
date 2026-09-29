import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { commitToAction } from '../commit-to-action.service.ts'

describe('commitToAction()', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('creates a new action choice for a given user', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: user.id,
      })
    ).resolves.toBeUndefined()
  })

  it('upsert an existing action choice if it already exist for a given user', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: user.id,
      })
    ).resolves.toBeUndefined()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: user.id,
      })
    ).resolves.toBeUndefined()
  })
})

import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { commitToAction } from '../commit-to-action.service.ts'
import { getPersonalizedActionDetails } from '../get-personalized-action-details.service.ts'

describe('commitToAction()', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('commits a given user to an action', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    await expect(
      commitToAction({
        actionId: action.id,
        userId: user.id,
      })
    ).resolves.toBeUndefined()

    const { action: actionUpdated } =
      (await getPersonalizedActionDetails(action.slug, 'fr', user.id)) ?? {}

    expect(actionUpdated?.choice).toBeDefined()
  })

  it('can commit to an already committed to action', async () => {
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

    const { action: actionUpdated } =
      (await getPersonalizedActionDetails(action.slug, 'fr', user.id)) ?? {}

    expect(actionUpdated?.choice).toBeDefined()
  })
})

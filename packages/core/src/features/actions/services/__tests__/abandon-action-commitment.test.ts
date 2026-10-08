import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { abandonActionCommitment } from '../abandon-action-commitment.service.ts'
import { getPersonalizedActionDetails } from '../get-personalized-action-details.service.ts'

describe('abandonActionCommitment', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('should abandon the existing commitment', async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()
    const actionId = action.id
    const userId = user.id

    await actionFactory.chosen({
      actionId: action.id,
      userId: user.id,
    })

    const { action: actionAfterCommitment } =
      (await getPersonalizedActionDetails(action.slug, 'fr', userId)) ?? {}

    expect(actionAfterCommitment).toBeDefined()
    expect(actionAfterCommitment?.choice).toBeDefined()

    await abandonActionCommitment({
      actionId,
      userId,
    })

    const { action: actionAfterAbandonment } =
      (await getPersonalizedActionDetails(action.slug, 'fr', userId)) ?? {}

    expect(actionAfterAbandonment).toBeDefined()
    expect(actionAfterAbandonment?.choice).toEqual(null)
  })

  it("shouldn't throw if trying to abandon a inexistant commitment", async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()
    const actionId = action.id
    const userId = user.id

    const { action: actionAfterCommitment } =
      (await getPersonalizedActionDetails(action.slug, 'fr', userId)) ?? {}

    expect(actionAfterCommitment).toBeDefined()
    expect(actionAfterCommitment?.choice).toBeDefined()

    await expect(
      abandonActionCommitment({
        actionId,
        userId,
      })
    ).resolves.toBeUndefined()
  })
})
